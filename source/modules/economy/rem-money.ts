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
    name: 'remove-money',
    description: 'Remove money from a user.',
  })
  async removeMoney(
    @SlashOption({
      name: 'user',
      description: 'The user to remove money from.',
      type: ApplicationCommandOptionType.User,
      required: true,
    })
    user: User,

    @SlashOption({
      name: 'amount',
      description: 'The amount of money to remove.',
      type: ApplicationCommandOptionType.Integer,
      required: true,
      minValue: 1,
    })
    amount: number,

    @SlashChoice('USD', 'OSRS')
    @SlashOption({
      name: 'type',
      description: 'The type of money to remove.',
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    moneyType: 'USD' | 'OSRS',

    interaction: Loggable<ChatInputCommandInteraction>
  ) {
    const userRecord = await this.prisma.user.upsert({
      where: { discordId: user.id },
      create: { discordId: user.id },
      select: {
        [moneyType === 'USD' ? 'balanceUSD' : 'balanceOSRS']: true,
      },
      update: {},
    });

    if (
      userRecord[moneyType === 'USD' ? 'balanceUSD' : 'balanceOSRS'] < amount
    ) {
      await interaction.reply({
        content: `You can't remove ${amount} coins from ${user.toString()} because they only have ${
          userRecord.balance
        } coins.`,
        ephemeral: true,
      });

      return;
    }

    await this.prisma.user.update({
      where: { discordId: user.id },
      data: {
        [moneyType === 'USD' ? 'balanceUSD' : 'balanceOSRS']: {
          decrement: amount,
        },
      },
      select: {
        [moneyType === 'USD' ? 'balanceUSD' : 'balanceOSRS']: true,
      },
    });

    await interaction.reply({
      content: `**${amount} ${moneyType}** have been removed from ${user}.`,
      ephemeral: true,
    });
  }
}
