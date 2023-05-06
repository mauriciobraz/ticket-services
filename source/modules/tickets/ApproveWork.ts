import { PrismaClient } from '@prisma/client';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { ButtonComponent, Discord } from 'discordx';

import {
  SUPERVISOR_ROLE_ID,
  WORKER_NOTIFICATIONS_CHANNEL_ID,
  WORKER_ROLE_ID,
} from '@/schemas/dotenv';

import { RegExpEventHandler } from './shared';

@Discord()
export class ApproveWork {
  constructor(private readonly prisma: PrismaClient) {}

  @ButtonComponent({
    id: RegExpEventHandler.createRegExp('ApproveWork'),
  })
  async onApproveTicket(interaction: ButtonInteraction) {
    if (
      Array.isArray(interaction.member?.roles)
        ? !interaction.member?.roles.includes(SUPERVISOR_ROLE_ID)
        : !interaction.member?.roles.cache.has(SUPERVISOR_ROLE_ID)
    ) {
      await interaction.reply({
        content:
          'You are not authorized to confirm service completion. Only supervisors can confirm service completion.',
        ephemeral: true,
      });

      return;
    }

    const [workId] = RegExpEventHandler.parseEventId<'ApproveWork'>(
      interaction.customId
    );

    const work = await this.prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        reason: true,
        user: {
          select: {
            discordId: true,
            balanceUSD: true,
          },
        },
      },
    });

    if (!work) {
      await interaction.reply({
        content: 'Ticket not found. Please contact a server administrator.',
        ephemeral: true,
      });

      return;
    }

    await this.prisma.work.update({
      where: { id: workId },
      data: {
        status: 'Approved',
        channelId: interaction.channelId,
        messageId: interaction.message.id,
      },
    });

    // Ask the user for the price of the work
    const { modalInteraction, price } = await this.askPrice(interaction);

    await modalInteraction.deferReply({
      ephemeral: true,
    });

    // Check if the price is more than user have.
    if (price > work.user.balanceUSD) {
      const closeTicketButton = new ButtonBuilder()
        .setCustomId(RegExpEventHandler.createEventId('CloseWork', work.id))
        .setStyle(ButtonStyle.Danger)
        .setLabel('Close Ticket')
        .setEmoji('🔒');

      await modalInteraction.followUp({
        content:
          "The price you provided is more than the user has. If it wasn't an error, you can mark this work as closed on the button bellow.",
        ephemeral: true,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            closeTicketButton
          ),
        ],
      });

      return;
    }

    // Update the ticket with the price
    await this.prisma.work.update({
      where: { id: workId },
      data: { price },
    });

    // Notify the workers
    await this.notifyWorkers(interaction, {
      ...work,
      price,
    });

    await interaction.editReply({
      components: [],
      embeds: [
        new EmbedBuilder()
          .setTitle('Ticket Approved')
          .setDescription(
            'Your ticket has been approved. You will be notified when a worker claims your ticket.'
          ),
      ],
    });
  }

  /**
   * Ask the user for the price of the work.
   * @param interaction Interaction that triggered the event.
   * @returns The interaction used for the modal and the reason provided by the user.
   */
  private async askPrice(interaction: ButtonInteraction) {
    const modal = new ModalBuilder()
      .setCustomId(`CREATE_TICKET&${interaction.id}`)
      .setTitle('Questions about the work');

    modal.addComponents([
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel('How much will you charge?')
          .setCustomId('price')
          .setPlaceholder('Enter the price here (in USD and no symbols)')
          .setStyle(TextInputStyle.Short)
      ),
    ]);

    await interaction.showModal(modal);

    const modalSubmit = await interaction.awaitModalSubmit({
      time: 60e3,
      filter: (component) =>
        component.customId === `CREATE_TICKET&${interaction.id}`,
    });

    const rawPrice = modalSubmit.fields.fields.get('price')!.value;
    const price = Number(rawPrice);

    if (isNaN(price)) {
      await modalSubmit.followUp({
        content:
          'The price you provided is not a valid number. Please try again.',
        ephemeral: true,
      });

      return {
        modalInteraction: modalSubmit,
        price: NaN,
      };
    }

    return {
      modalInteraction: modalSubmit,
      price,
    };
  }

  private async notifyWorkers(
    interaction: ButtonInteraction,
    work: {
      reason: string;
      id: string;
      user: { discordId: string };
      price: number;
    }
  ) {
    const workersChannel = await interaction.guild?.channels.fetch(
      WORKER_NOTIFICATIONS_CHANNEL_ID,
      { cache: true }
    );

    if (workersChannel?.type !== ChannelType.GuildText) {
      throw new Error(
        `The channel with ID ${WORKER_NOTIFICATIONS_CHANNEL_ID} is not a text channel.`
      );
    }

    const ticketEmbed = new EmbedBuilder()
      .setTitle(`Ticket (${work.id})`)
      .setDescription(
        `A new ticket has been approved by <@${interaction.user.id}> for <@${work.user.discordId}>.`
      )
      .addFields([
        { name: 'Price', value: `$${work.price}` },
        { name: 'Description', value: work.reason },
      ])
      .setFooter({
        text: work.id,
      })
      .setColor('Blurple');

    const claimTicketButton = new ButtonBuilder()
      .setCustomId(RegExpEventHandler.createEventId('ClaimWork', work.id))
      .setStyle(ButtonStyle.Primary)
      .setLabel('Claim Ticket')
      .setEmoji('🔒');

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      claimTicketButton
    );

    return await workersChannel.send({
      content: `<@&${WORKER_ROLE_ID}>`,
      embeds: [ticketEmbed],
      components: [actionRow],
    });
  }
}
