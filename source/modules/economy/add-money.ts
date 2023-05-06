import { PrismaClient } from '@prisma/client';
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  User,
} from 'discord.js';
import { Discord, Guard, Slash, SlashChoice, SlashOption } from 'discordx';

import { OnlyOwners } from '@/guards/OnlyOwners';

@Discord()
export class Economy {
  constructor(private readonly prisma: PrismaClient) {}

  @Guard(OnlyOwners)
  @Slash({
    name: 'add-money',
    description: 'Add money to a user.',
  })
  async addMoney(
    @SlashOption({
      name: 'user',
      description: 'The user to add money to.',
      type: ApplicationCommandOptionType.User,
      required: true,
    })
    user: User,

    @SlashOption({
      name: 'amount',
      description: 'The amount of money to add.',
      type: ApplicationCommandOptionType.Integer,
      required: true,
      minValue: 1,
    })
    amount: number,

    @SlashChoice('USD', 'OSRS')
    @SlashOption({
      name: 'type',
      description: 'The type of money to add.',
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    moneyType: 'USD' | 'OSRS',

    interaction: Loggable<ChatInputCommandInteraction>
  ) {
    await this.prisma.user.upsert({
      where: { discordId: user.id },
      create: {
        discordId: user.id,
        [moneyType === 'USD' ? 'balanceUSD' : 'balanceOSRS']: amount,
      },
      update: {
        [moneyType === 'USD' ? 'balanceUSD' : 'balanceOSRS']: {
          increment: amount,
        },
      },
      select: { id: true },
    });

    await interaction.reply({
      content: `Added **${amount} ${moneyType}** to ${user.toString()}.`,
      ephemeral: true,
    });
  }
}
