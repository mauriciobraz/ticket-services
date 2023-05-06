// ONLY SUPERVISOR CAN APPROVE REQUESTS CONFIRMATIONS

import { PrismaClient } from '@prisma/client';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
} from 'discord.js';
import { ButtonComponent, Discord } from 'discordx';

import { SUPERVISOR_ROLE_ID } from '@/schemas/dotenv';

import { RegExpEventHandler } from './shared';

@Discord()
export class ConfirmServiceCompletion {
  constructor(private readonly prisma: PrismaClient) {}

  @ButtonComponent({
    id: RegExpEventHandler.createRegExp('ConfirmServiceCompletion'),
  })
  async onConfirmServiceCompletion(interaction: ButtonInteraction) {
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

    const [workId] =
      RegExpEventHandler.parseEventId<'ConfirmServiceCompletion'>(
        interaction.customId
      );

    const work = await this.prisma.work.findUnique({
      where: { id: workId },
      select: {
        status: true,
        channelId: true,
        worker: {
          select: {
            discordId: true,
          },
        },
        user: {
          select: {
            discordId: true,
          },
        },
        price: true,
      },
    });

    if (!work) {
      await interaction.reply({
        content: 'Work not found. Please contact a server administrator.',
        ephemeral: true,
      });

      return;
    }

    if (!work.worker) {
      await interaction.reply({
        content:
          'The worker has not been assigned to the work. Please contact a server administrator.',
        ephemeral: true,
      });

      return;
    }

    // Update the work status to "Completed"
    await this.prisma.work.update({
      where: { id: workId },
      data: {
        status: 'Completed',
      },
    });

    // Notify the worker
    await interaction.reply({
      content: `Work ${workId} has been confirmed as completed. The worker <@${work.worker.discordId}> has been notified.`,
      ephemeral: true,
    });

    const workerChannel = await interaction.guild?.channels.fetch(
      work.channelId
    );

    if (workerChannel?.type !== ChannelType.GuildText) {
      await interaction.reply({
        content:
          'Work channel not found. Please contact a server administrator.',
        ephemeral: true,
      });

      return;
    }

    // Removes the work price from the user's balance
    // and adds it to the worker's balance
    await this.applyBalanceChanges(
      workId,
      work.worker.discordId,
      work.user.discordId,
      work.price!
    );

    await workerChannel.permissionOverwrites.edit(work.user.discordId, {
      SendMessages: false,
    });

    await workerChannel.permissionOverwrites.edit(work.user.discordId, {
      ViewChannel: true,
      SendMessages: false,
    });

    await interaction.message.edit({
      content: `Work was marked as completed (\`\`${workId}\`\`).`,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(RegExpEventHandler.createEventId('DeleteChannel'))
            .setLabel('Delete Channel')
            .setStyle(ButtonStyle.Danger)
        ),
      ],
      embeds: [],
    });
  }

  private async applyBalanceChanges(
    workId: string,
    workerId: string,
    userId: string,
    price: number
  ) {
    await this.prisma.user.update({
      where: { discordId: userId },
      data: {
        balanceUSD: {
          decrement: price,
        },
      },
    });

    await this.prisma.user.update({
      where: { discordId: workerId },
      data: {
        balanceUSD: {
          increment: price,
        },
      },
    });
  }
}
