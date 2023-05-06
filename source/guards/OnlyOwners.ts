import { Interaction } from 'discord.js';
import { GuardFunction } from 'discordx';

import { OWNERS_IDS } from '@/schemas/dotenv';

export const OnlyOwners: GuardFunction<Interaction> = async (
  interaction,
  _client,
  next
) => {
  if (OWNERS_IDS.includes(interaction.user.id)) {
    return await next();
  }

  if (interaction.isRepliable()) {
    await interaction.reply({
      content: 'You are not allowed to use this command',
      ephemeral: true,
    });
  }
};
