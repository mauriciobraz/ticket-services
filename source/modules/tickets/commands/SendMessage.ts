import { PrismaClient } from '@prisma/client';
import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { Discord, Slash } from 'discordx';

import {
  RegExpEventHandler,
  TicketCategoryEmojis,
  WORK_TYPES,
} from '../shared';

const IMAGE_URL =
  'https://media.discordapp.net/attachments/1103383370223849604/1104198963160170606/Black_Futuristic_Welcome_Discord_Profile_Banner_1.gif';

@Discord()
export class Tickets {
  constructor(private readonly prisma: PrismaClient) {}

  @Slash({
    name: 'send-message',
    description: 'Send the message to create a ticket.',
  })
  async sendMessage(interaction: Loggable<ChatInputCommandInteraction>) {
    const openTicketEmbed = new EmbedBuilder()
      .setTitle("Style Services' Ticket")
      .setDescription(
        'Please select your desired category below, and we will assist you shortly!\n\nRead our <#1104100519489843240>\nAlso <#1104100628642418758>'
      )
      .setFooter({
        text: 'By creating a ticket you are agreeing to our terms of service.',
      })
      .setImage(IMAGE_URL)
      .setColor('Orange');

    const ticketCategorySelectMenu = new StringSelectMenuBuilder()
      .setCustomId(RegExpEventHandler.createEventId('CreateTicket'))
      .setPlaceholder('Select a category')
      .addOptions(
        WORK_TYPES.map((workType) =>
          new StringSelectMenuOptionBuilder()
            .setValue(workType)
            .setLabel(workType.replace(/([A-Z])/g, ' $1').trim())
            .setEmoji(TicketCategoryEmojis[workType])
        )
      );

    const ticketCategoryActionRow =
      new ActionRowBuilder<StringSelectMenuBuilder>();

    ticketCategoryActionRow.addComponents(ticketCategorySelectMenu);

    await interaction.channel?.send({
      components: [ticketCategoryActionRow],
      embeds: [openTicketEmbed],
    });
  }
}
