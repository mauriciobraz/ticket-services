import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ComponentType,
  type BaseMessageOptions,
  type Interaction,
} from 'discord.js';

/** Takes a promise and returns a tuple with the data or error. */
async function catchPromiseError<E extends Error, T = unknown>(
  promise: Promise<T>
) {
  return promise
    .then<[T, null]>((data) => [data, null])
    .catch<[null, E]>((error) => [null, error]);
}
export namespace Pagination {
  export enum ButtonId {
    First = 'first',
    Last = 'last',
    Next = 'next',
    Previous = 'previous',
    Close = 'close',
  }

  export enum Result {
    TimedOut = 'TimedOut',
    Closed = 'Closed',
  }

  /** @extends BaseMessageOptions Remove components from the base message options. */
  export type PaginableBaseMessageOptions = BaseMessageOptions;

  /** Handler for resolving the message options for each page. */
  export type Resolver = (
    page: number,
    options: Options
  ) => Promise<PaginableBaseMessageOptions> | PaginableBaseMessageOptions;

  export interface Options {
    /** Amount of pages to be generated. */
    amount: number;

    /** Handles the message options for each page. */
    resolver: Resolver;

    /** Use ephemeral messages for the pagination session. */
    ephemeral?: boolean;

    /** Buttons options to use for the pagination session. */
    buttons?: ButtonOptions;

    /**
     * If true, all resolvers will be loaded before starting the pagination.
     * @default false
     */
    eagerLoad?: boolean;

    /**
     * Adds a button to the message that shows the current page number.
     * @default false
     */
    showPageNumber?: boolean;

    /**
     * Adds buttons to the message that allow the user to go to the first and last page.
     * @default false
     */
    showFirstLastButtons?: boolean;

    /**
     * Adds a button to the message that allows the user to close the pagination session.
     * @default false
     */
    showCloseButton?: boolean;

    /**
     * Time in milliseconds to wait until the pagination session times out.
     * @default 120e3
     */
    timeout?: number;
  }

  export interface ButtonOptions {
    /** The button to go to the previous page. */
    previous?: Button;

    /** The button to go to the next page. */
    next?: Button;

    /** The button to go to the first page. */
    first?: Button;

    /** The button to go to the last page. */
    last?: Button;

    /** The button to close the pagination session. */
    close?: Button;
  }

  export interface Button {
    /** The label of the button. */
    label: string;

    /** The style of the button. */
    style: ButtonStyle;

    /** The emoji of the button. */
    emoji?: string;
  }

  /** Paginates over the given options. */
  export async function paginate(interaction: Interaction, options: Options) {
    if (!interaction.inGuild()) {
      throw new Error('Cannot start a pagination session outside of a guild.');
    }

    if (!interaction.isRepliable()) {
      throw new Error(
        'Cannot start a pagination session without a repliable interaction.'
      );
    }

    if (!interaction.channelId) {
      throw new Error(
        'Cannot start a pagination session without a channel ID.'
      );
    }

    // Since Node.js arrays are 0-indexed, we need to subtract 1 from the amount
    // to get the an human-readable amount of pages.
    options.amount--;

    let closed = false;
    let currentPage = 0;

    const pages = await generateInitialPages(interaction, options);

    // TODO: Add a way to customize which reply method to use (reply, followUp, etc.)
    if (interaction.deferred || interaction.replied)
      await interaction.followUp({
        ...pages[currentPage],
        ephemeral: options.ephemeral,
      });
    else
      await interaction.reply({
        ...pages[currentPage],
        ephemeral: options.ephemeral,
      });

    const guild =
      interaction.guild ??
      (await interaction.client.guilds.fetch(interaction.guildId));

    const channel =
      interaction.channel ??
      (await guild.channels.fetch(interaction.channelId));

    if (channel?.type !== ChannelType.GuildText) {
      throw new Error(
        'Cannot start a pagination session in a non-text channel.'
      );
    }

    while (!closed) {
      const [component, componentError] = await catchPromiseError(
        channel.awaitMessageComponent({
          componentType: ComponentType.Button,
          time: options.timeout ?? 120e3,
          filter: (componentInteraction) =>
            componentInteraction.user.id === interaction.user.id,
        })
      );

      if (componentError?.name === 'Error [InteractionCollectorError]') {
        return Result.TimedOut;
      }

      await component?.deferUpdate();

      switch (component?.customId) {
        case ButtonId.First:
          currentPage = 0;
          break;

        case ButtonId.Last:
          currentPage = options.amount;
          break;

        case ButtonId.Next:
          currentPage++;
          break;

        case ButtonId.Previous:
          currentPage--;
          break;

        case ButtonId.Close:
          closed = true;
          break;

        default:
          throw new Error('Unknown button ID');
      }

      const newPage = await generatePage(interaction, options, currentPage);
      await component.editReply(newPage);
    }

    return Result.Closed;
  }

  // Helper functions.

  /** Generates the initial pages for the given resolver with the given options. */
  export async function generateInitialPages(
    interaction: Interaction,
    options: Options
  ): Promise<PaginableBaseMessageOptions[]> {
    // Preload all pages if the option is enabled.
    // This is useful for when the pages are fast to generate.
    if (options.eagerLoad) {
      return await Promise.all(
        Array.from({ length: options.amount }, async (_, index) => {
          return await generatePage(interaction, options, index);
        })
      );
    }

    // Otherwise, only load the first, second, and last page to reduce the
    // amount of unnecessary calls (e.g. database queries).
    return ([] as PaginableBaseMessageOptions[]).concat(
      await generatePage(interaction, options, 0),
      await generatePage(interaction, options, 1),
      await generatePage(interaction, options, options.amount - 1)
    );
  }

  /** Generates a message options with controls for the given page. */
  export async function generatePage(
    interaction: Interaction,
    options: Options,
    page: number
  ): Promise<BaseMessageOptions> {
    const controlActionRow = new ActionRowBuilder<ButtonBuilder>();

    // Add the page number if the option is enabled.
    if (options.showPageNumber) {
      controlActionRow.addComponents(
        new ButtonBuilder()
          .setLabel(`${page + 1} / ${options.amount + 1}`)
          .setDisabled(true)
          .setCustomId('PN')
          .setStyle(ButtonStyle.Secondary)
      );
    }

    // Add the first button if the option is enabled.
    if (options.showFirstLastButtons) {
      const { label, emoji, style } = options.buttons?.first ?? {
        label: 'First',
        id: ButtonId.First,
        style: ButtonStyle.Danger,
      };

      const firstButton = new ButtonBuilder()
        .setCustomId(ButtonId.First)
        .setLabel(label)
        .setStyle(style)
        .setDisabled(page === 0);

      if (emoji) {
        firstButton.setEmoji(emoji);
      }

      controlActionRow.addComponents(firstButton);
    }

    // Add the previous and next buttons.
    const {
      label: previousLabel,
      emoji: previousEmoji,
      style: previousStyle,
    } = options.buttons?.previous ?? {
      label: 'Previous',
      id: ButtonId.Previous,
      style: ButtonStyle.Primary,
    };

    const {
      label: nextLabel,
      emoji: nextEmoji,
      style: nextStyle,
    } = options.buttons?.next ?? {
      label: 'Next',
      id: ButtonId.Next,
      style: ButtonStyle.Primary,
    };

    const previousButton = new ButtonBuilder()
      .setCustomId(ButtonId.Previous)
      .setLabel(previousLabel)
      .setStyle(previousStyle)
      .setDisabled(page === 0);
    if (previousEmoji) previousButton.setEmoji(previousEmoji);

    const nextButton = new ButtonBuilder()
      .setCustomId(ButtonId.Next)
      .setLabel(nextLabel)
      .setStyle(nextStyle)
      .setDisabled(page === options.amount);
    if (nextEmoji) nextButton.setEmoji(nextEmoji);

    controlActionRow.addComponents(previousButton, nextButton);

    if (options.showFirstLastButtons) {
      const { label, emoji, style } = options.buttons?.last ?? {
        label: 'Last',
        id: ButtonId.Last,
        style: ButtonStyle.Danger,
      };

      const lastButton = new ButtonBuilder()
        .setCustomId(ButtonId.Last)
        .setLabel(label)
        .setStyle(style)
        .setDisabled(page === options.amount);
      if (emoji) lastButton.setEmoji(emoji);

      controlActionRow.addComponents(lastButton);
    }

    if (options.showCloseButton) {
      const { label, emoji, style } = options.buttons?.close ?? {
        label: 'Close',
        id: ButtonId.Close,
        style: ButtonStyle.Danger,
      };

      const closeButton = new ButtonBuilder()
        .setCustomId(ButtonId.Close)
        .setLabel(label)
        .setStyle(style);
      if (emoji) closeButton.setEmoji(emoji);

      controlActionRow.addComponents(closeButton);
    }

    const resolvedOptions = await options.resolver(page, options);

    return {
      ...resolvedOptions,
      components: [...(resolvedOptions.components ?? []), controlActionRow],
    };
  }
}
