import { PrismaClient } from '@prisma/client';
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  User,
} from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';

@Discord()
export class Economy {
  constructor(private readonly prisma: PrismaClient) {}

  @Slash({
    name: 'view-money',
    description: 'Check how much money you or someone else has.',
  })
  async viewMoney(
    @SlashOption({
      name: 'user',
      description: 'The user to check the balance of.',
      type: ApplicationCommandOptionType.User,
      required: true,
    })
    user: User,

    interaction: Loggable<ChatInputCommandInteraction>
  ) {
    const userRecord = await this.prisma.user.upsert({
      where: { discordId: user.id },
      create: { discordId: user.id },
      select: {
        balanceUSD: true,
        balanceOSRS: true,
      },
      update: {},
    });

    await interaction.reply({
      content: `${user} has **${userRecord.balanceUSD} USD** and **${userRecord.balanceOSRS} OSRS**`,
      ephemeral: true,
    });
  }
}
