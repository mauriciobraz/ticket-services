import { PrismaClient } from '@prisma/client';
import { ButtonInteraction, ChannelType } from 'discord.js';
import { ButtonComponent, Discord } from 'discordx';

import { SUPERVISOR_ROLE_ID } from '@/schemas/dotenv';

import { RegExpEventHandler } from './shared';

@Discord()
export class CloseWork {
  constructor(private readonly prisma: PrismaClient) {}

  @ButtonComponent({
    id: RegExpEventHandler.createRegExp('CloseWork'),
  })
  async onCloseWork(interaction: ButtonInteraction) {
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

    const [workId] = RegExpEventHandler.parseEventId<'CloseWork'>(
      interaction.customId
    );

    // Fetch the work from the database
    const work = await this.prisma.work.findUnique({
      where: { id: workId },
    });

    if (!work) {
      await interaction.reply({
        content: 'Work not found. Please contact a server administrator.',
        ephemeral: true,
      });
      return;
    }

    if (interaction.channel?.type !== ChannelType.GuildText) {
      await interaction.reply({
        content:
          "Could not close the work as the interaction's channel is not a text channel.",
        ephemeral: true,
      });
    }

    await this.prisma.work.update({
      where: { id: work.id },
      data: { status: 'Closed' },
    });

    await interaction.channel?.delete();
  }
}
