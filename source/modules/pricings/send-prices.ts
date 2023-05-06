import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { Discord, Guard, SelectMenuComponent, Slash } from 'discordx';

import { DATA } from '@/data';
import { OnlyOwners } from '@/guards/OnlyOwners';
import { Pagination } from '@/libraries/pagination';

const ITEM_PREFIX = 'item::';
const ITEM_CUSTOM_ID_REGEX = new RegExp(`^${ITEM_PREFIX}(.+)$`);

@Discord()
export class SendPrices {
  @Guard(OnlyOwners)
  @Slash({
    name: 'send-prices',
    description: 'Send prices to the channel',
  })
  async sendPrices(interaction: ChatInputCommandInteraction) {
    // Create action rows and select menus for each record
    const actionRows = Object.values(DATA).map((record) => {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`${ITEM_PREFIX}${record.name}`)
        .setPlaceholder(record.name)
        .addOptions(
          record.items.map((item, index) => ({
            value: index.toString(),
            label: item.name,
            emoji: item.emoji,
          }))
        );

      return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        selectMenu
      );
    });

    // Send the select menus to the channel
    await interaction.reply({
      components: actionRows,
    });
  }

  @SelectMenuComponent({
    id: ITEM_CUSTOM_ID_REGEX,
  })
  async selectItem(interaction: StringSelectMenuInteraction) {
    const selectedCategory =
      DATA[interaction.customId.replace(ITEM_PREFIX, '')];

    const selectedItemIndex = parseInt(interaction.values[0], 10);
    const selectedItem = selectedCategory.items[selectedItemIndex];

    console.log({
      selectedItem: interaction.values,
    });

    if (Array.isArray(selectedItem.message)) {
      await Pagination.paginate(interaction, {
        amount: selectedItem.message.length,
        eagerLoad: true,
        resolver: (page) => ({
          embeds: [
            new EmbedBuilder()
              .setTitle(selectedItem.name)
              .setDescription(selectedItem.message[page])
              .setTimestamp()
              .setColor('Orange'),
          ],
        }),
        ephemeral: true,
      });

      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(selectedItem.name)
      .setDescription(selectedItem.message)
      .setTimestamp()
      .setColor('Orange');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
