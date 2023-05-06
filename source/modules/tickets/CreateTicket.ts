import { PrismaClient } from '@prisma/client';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CategoryChannel,
  ChannelType,
  EmbedBuilder,
  ModalBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Discord, SelectMenuComponent } from 'discordx';

import { randomString } from '@/libraries/random';
import { SUPERVISOR_ROLE_ID, TICKET_CATEGORY_ID } from '@/schemas/dotenv';

import { RegExpEventHandler, WorkType } from './shared';

interface CreateTicketChannelOptions {
  interaction: StringSelectMenuInteraction<'cached' | 'raw'>;
  ticketsCategory: CategoryChannel;
  workType: WorkType;
}

@Discord()
export class TicketsCreateTicket {
  constructor(private readonly prisma: PrismaClient) {}

  @SelectMenuComponent({
    id: RegExpEventHandler.createRegExp('CreateTicket'),
  })
  async onCreateTicket(interaction: StringSelectMenuInteraction) {
    if (!interaction.inGuild()) {
      throw new Error(
        'TicketsCreateTicket.onCreateTicket: Interaction is not in a guild.'
      );
    }

    const workType = interaction.values[0] as WorkType;

    // Ensure the ticket category exists.
    // And if it does, also ensure it is a category.

    const ticketsCategory = await this.getTicketsCategory(interaction);
    const { modalInteraction, reason } = await this.askReason(interaction);

    await modalInteraction.deferReply({
      ephemeral: true,
    });

    const ticketChannel = await this.createTicketChannel({
      workType,
      interaction,
      ticketsCategory,
    });

    const work = await this.prisma.work.create({
      data: {
        reason,
        type: workType,
        status: 'InProgress',
        user: {
          connectOrCreate: {
            create: { discordId: interaction.user.id },
            where: { discordId: interaction.user.id },
          },
        },
        channelId: ticketChannel.id,
      },
      select: {
        id: true,
        user: {
          select: {
            balanceUSD: true,
          },
        },
      },
    });

    const ticketEmbed = new EmbedBuilder()
      .setTitle(`Ticket (${workType.replace(/([A-Z])/g, ' $1').trim()})`)
      .addFields([
        { name: 'Balance (USD)', value: `${work.user.balanceUSD} $` },
        { name: 'Reason', value: reason },
      ])
      .setFooter({ text: `Ticket ID: ${work.id}` })
      .setColor('Blurple');

    const closeTicketButton = new ButtonBuilder()
      .setCustomId(RegExpEventHandler.createEventId('CloseWork', work.id))
      .setStyle(ButtonStyle.Danger)
      .setLabel('Close Ticket')
      .setEmoji('🔒');

    const approveTicketButton = new ButtonBuilder()
      .setCustomId(RegExpEventHandler.createEventId('ApproveWork', work.id))
      .setStyle(ButtonStyle.Success)
      .setLabel('Approve Ticket')
      .setEmoji('✅');

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      closeTicketButton,
      approveTicketButton
    );

    await ticketChannel.send({
      content: `<@${interaction.user.id}> <@&${SUPERVISOR_ROLE_ID}>`,
      embeds: [ticketEmbed],
      components: [actionRow],
    });

    await modalInteraction.editReply({
      content: `Your ticket has been created at ${ticketChannel.toString()}`,
    });
  }

  /**
   * Get the tickets category from the guild.
   * @param interaction Interaction that triggered the event.
   * @returns The ticket category if it exists and is a category.
   */
  private async getTicketsCategory(interaction: StringSelectMenuInteraction) {
    const ticketsCategory = await interaction.guild?.channels.fetch(
      TICKET_CATEGORY_ID,
      { cache: true }
    );

    if (ticketsCategory?.type !== ChannelType.GuildCategory) {
      await interaction.reply({
        content:
          'Please contact a server administrator as the ticket category is not a category.',
      });

      throw new Error(
        'TicketsCreateTicket.getTicketsCategory: Ticket category is not a category.'
      );
    }

    return ticketsCategory;
  }

  /**
   * Ask the user for the reason of the ticket.
   * @param interaction Interaction that triggered the event.
   * @returns The interaction used for the modal and the reason provided by the user.
   */
  private async askReason(interaction: StringSelectMenuInteraction) {
    const modal = new ModalBuilder()
      .setCustomId(`CREATE_TICKET&${interaction.id}`)
      .setTitle('Questions about the work');

    modal.addComponents([
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel('Reason')
          .setCustomId('reason')
          .setPlaceholder('Please describe the work you want.')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(128)
      ),
    ]);

    await interaction.showModal(modal);

    const modalSubmit = await interaction.awaitModalSubmit({
      time: 60e3,
      filter: (component) =>
        component.customId === `CREATE_TICKET&${interaction.id}`,
    });

    return {
      modalInteraction: modalSubmit,
      reason: modalSubmit.fields.fields.get('reason')!.value,
    };
  }

  /**
   * Create the ticket channel for the user if they don't have one already.
   * @param options Options for the ticket channel creation.
   * @returns The created ticket channel.
   */
  private async createTicketChannel(options: CreateTicketChannelOptions) {
    const ticketChannel = await options.ticketsCategory.children.create({
      name: `${options.workType.toLowerCase()}-${randomString(6)}`,
      permissionOverwrites: [
        {
          id: options.ticketsCategory.guildId,
          deny: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
        {
          id: options.interaction.user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
        {
          id: SUPERVISOR_ROLE_ID,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
      ],
    });

    return ticketChannel;
  }
}
