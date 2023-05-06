import { PrismaClient } from '@prisma/client';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
} from 'discord.js';
import { ButtonComponent, Discord } from 'discordx';

import { RegExpEventHandler } from './shared';

@Discord()
export class ClaimWork {
  constructor(private readonly prisma: PrismaClient) {}

  @ButtonComponent({
    id: RegExpEventHandler.createRegExp('ClaimWork'),
  })
  async onClaimWork(interaction: ButtonInteraction) {
    const [workId] = RegExpEventHandler.parseEventId<'ClaimWork'>(
      interaction.customId
    );

    // Fetch the work from the database
    const work = await this.prisma.work.findUnique({
      where: { id: workId },
      select: {
        user: {
          select: {
            discordId: true,
          },
        },
        channelId: true,
        messageId: true,
      },
    });

    if (!work) {
      await interaction.reply({
        content: 'Work not found. Please contact a server administrator.',
        ephemeral: true,
      });

      return;
    }

    if (!work.messageId) {
      await interaction.reply({
        content:
          'Work message not found. Please contact a server administrator.',
        ephemeral: true,
      });

      return;
    }

    // Update the work status and workerId in the database
    await this.prisma.work.update({
      where: { id: workId },
      data: {
        status: 'InProgress',
        worker: {
          connectOrCreate: {
            create: { discordId: interaction.user.id },
            where: { discordId: interaction.user.id },
          },
        },
      },
    });

    // Adds the worker to the channel

    const channel = await interaction.guild?.channels.fetch(work.channelId, {
      cache: true,
    });

    if (channel?.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: 'Channel not found. Please contact a server administrator.',
        ephemeral: true,
      });

      return;
    }

    await channel.permissionOverwrites.create(interaction.user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    const workMessage = await channel.messages.fetch(work.messageId);

    await workMessage.edit({
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(
              RegExpEventHandler.createEventId(
                'ConfirmServiceCompletion',
                workId
              )
            )
            .setLabel('Finish Work')
            .setStyle(ButtonStyle.Primary)
        ),
      ],
      embeds: [
        EmbedBuilder.from(workMessage.embeds[0])
          .setColor('Blurple')
          .setAuthor({
            name: `Claimed by ${interaction.user.tag}`,
          })
          .setDescription(
            `<@${interaction.user.id}> has claimed this work. Note for the worker: when you finish the work, please ask a supervisor to approve it by using clicking the button below.`
          ),
      ],
      content: `<@${interaction.user.id}> <@${work.user.discordId}>`,
    });

    await interaction.reply({
      content: `You have claimed this work. Please check <#${work.channelId}> for more information.`,
      ephemeral: true,
    });

    await interaction.message.delete();
  }
}
