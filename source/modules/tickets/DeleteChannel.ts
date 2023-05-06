import { PrismaClient } from '@prisma/client';
import { ButtonInteraction } from 'discord.js';
import { ButtonComponent, Discord } from 'discordx';

import { SUPERVISOR_ROLE_ID } from '@/schemas/dotenv';

import { RegExpEventHandler } from './shared';

@Discord()
export class DeleteChannel {
  constructor(private readonly prisma: PrismaClient) {}

  @ButtonComponent({
    id: RegExpEventHandler.createRegExp('DeleteChannel'),
  })
  async onDeleteChannel(interaction: ButtonInteraction) {
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

    await interaction.channel?.delete();
  }
}
