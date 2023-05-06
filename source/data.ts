// cspell:disable

import dedent from 'ts-dedent';

/** BackTick */
const BT = '`';

export type Data = Record<
  string,
  {
    name: string;
    items: {
      name: string;
      emoji: string;
      message: string | string[];
    }[];
  }
>;

export const DATA: Data = {
  Skills: {
    name: 'Skills',
    items: [
      {
        name: 'Agility',
        emoji: '🏃',
        message: dedent`
            To order, please open a ticket in the channel

            ${BT}1-25: Tourist trap quest or 5m${BT}
            ${BT}Price per marks of grace = 350k/ea (Canifis course or better required)${BT}
            ${BT}+10% If you need marks collecting while training.${BT}

            **Level 90-99**: Ardougne Rooftop Course ${BT}90gp/xp${BT}
            **Level 80-90**: Rellekka Rooftop Course With Teleport ${BT}110gp/xp${BT}
            **Level 80+**: Prifddinas Agility Course ${BT}100gp/xp${BT}
            **Level 75-80**: Prifddinas Agility Course ${BT}140gp/xp${BT}
            **Level 70-75**: Pollnivneach Rooftop Course ${BT}160gp/xp${BT}
            **Level 60-70**: Seers Rooftop Course Without Teleport ${BT}210gp/xp${BT}
            **Level 60+**: Seers Rooftop Course With Teleport ${BT}150gp/xp${BT}
            **Level 50-60**: Falador Rooftop Course ${BT}150gp/xp${BT}
            **Level 40-50**: Canifis Rooftop Course ${BT}250gp/xp${BT}
            **Level 30-40**: Varrock Rooftop Course ${BT}140gp/xp${BT}
            **Level 25-30**: Alkharid Rooftop Course ${BT}160gp/xp${BT}
            **Level 1-25**: Gnome Stronghold Course ${BT}700gp/xp${BT}
          `,
      },
      {
        name: 'Construction',
        emoji: '🏗️',
        message: dedent`
          To order, please open a ticket in the channel

          ${BT}Prices below for mahogany homes are per exp (gp/xp).${BT}
          ${BT}25% If No Plank Sack.${BT}

          **Level 70-99**: Mahogany Homes ${BT}160gp/xp${BT}
          **Level 66-70**: Teak Garden Bench ${BT}30gp/xp${BT}
          **Level 52-66**: Mahogany Tables ${BT}35gp/xp${BT}
          **Level 50-52**: Mahogany Homes ${BT}220gp/xp${BT}
          **Level 50+**: Oak Larders With Butler ${BT}50gp/xp${BT}
          **Level 33-50**: Oak Larders Without Butler ${BT}100gp/xp${BT}
          **Level 20-33**: Mahogany Homes ${BT}300gp/xp${BT}
          **Level 1-20**: Mahogany Homes ${BT}450gp/xp${BT}
          **Level 1+**: Any type ${BT}120gp/xp${BT}
        `,
      },
      {
        name: 'Cooking',
        emoji: '🍳',
        message: dedent`
          To order, please open a ticket in the channel

          **Level 68-99**: Cooking Fish With Cooking Gauntlets ${BT}60gp/xp${BT}
          **Level 35-68**: Cooking Fish Without Cooking Gauntlets ${BT}80gp/xp${BT}
          **Level 35+**: Wines ${BT}25gp/xp${BT}
          **Level 1-35**: Best Fish ${BT}90gp/xp${BT}
        `,
      },
    ],
  },
  // Quests: {},
  PVM: {
    name: 'PVM',
    items: [
      {
        name: 'Firecapes',
        emoji: '🔥',
        message: dedent`
          **- With Rigour And 70+ Defence**
          - 90+ Range: ${BT}13M${BT}
          - 80+ Range: ${BT}18M${BT}
          - 75+ Range: ${BT}24M${BT}

          **- Below 70 Defence And 44+ Prayer And Rigour**
          - 85-99 Range: ${BT}20M${BT}
          - 75-84 Range: ${BT}25M${BT}
          - 70-74 Range: ${BT}35M${BT}
          - 61-69 Range: ${BT}45M${BT}

          **- Pures with 44+ Prayer**
          - 85-99 Range: ${BT}25M${BT}
          - 75-84 Range: ${BT}35M${BT}
          - 71-74 Range: ${BT}45M${BT}
          - 61-70 Range: ${BT}60M${BT}

          **- No Prayer Cape**
          Must Already Have Dwarven Rock Cake
          We Provide All Items And Sweets Except Dwarven Cake or Twisted Bow

          - 50+ Range, Below 50 Hp: ${BT}600M${BT}
          - 50+ Range, 50+ Hp: ${BT}566M${BT}
          - 50+ Range, 75+ Hp: ${BT}465M${BT}
          - 60+ Range, Below 50 Hp: ${BT}465M${BT}
          - 60+ Range, 50+ Hp: ${BT}433M${BT}
          - 60+ Range, 75+ Hp: ${BT}399M${BT}
          - 75+ Range, Below 50 Hp: ${BT}416M${BT}
          - 75+ Range, 50+ Hp: ${BT}382M${BT}
          - 75+ Range, 75+ Hp: ${BT}332M${BT}
          - 85+ Range, Below 50 Hp: ${BT}399M${BT}
          - 85+ Range, Below 50 Hp With Twisted Bow: ${BT}332M${BT}
          - 85+ Range, 50+ Hp: ${BT}366M${BT}
          - 85+ Range, 50+ Hp With Twisted Bow: ${BT}300M${BT}
          - 85+ Range, 75+ Hp: ${BT}300M${BT}
          - 85+ Range, 75+ Hp With Twisted Bow: ${BT}232M${BT}
          - 90+ Range, Below 50 Hp: ${BT}349M${BT}
          - 90+ Range, Below 50 Hp With Twisted Bow: ${BT}283M${BT}
          - 90+ Range, 50+ Hp: ${BT}315M${BT}
          - 90+ Range, 50+ Hp With Twisted Bow: ${BT}249M${BT}
          - 90+ Range, 75+ Hp: ${BT}283M${BT}
          - 90+ Range, 75+ Hp With Twisted Bow: ${BT}216M${BT}
          - Unique Cape 40+ Range, 34+ Hp: ${BT}798M${BT}
          - Unique Cape 40+ Range, 50+ Hp: ${BT}699M${BT}
          - Unique Cape 40+ Range, 75+ Hp: ${BT}632M${BT}
        `,
      },
      {
        name: 'Infernal/Jad Challenges',
        emoji: '👹',
        message: dedent`
          **- Mains**
          - Twisted Bow (Tbow): ${BT}275M${BT}
          - Bow of Faerdhinen (Bowfa): ${BT}315M${BT}
          - Armadyl Crossbow (ACB): ${BT}375M${BT}
          - Rune Crossbow (RCB): ${BT}425M${BT}
          - Slayer Task (Max Gear): ${BT}175M${BT}
          - Additional cost for No Rigour: 20M
          - Additional cost for lower than 94 Mage: 50M

          **- Zerkers**
          - Twisted Bow (Tbow): ${BT}400M${BT}
          - Armadyl Crossbow (ACB): ${BT}525M${BT}
          - Additional cost for lower than 94 Mage: 50M

          **- Pures**
          - Twisted Bow (Tbow): ${BT}500M${BT}
          - Armadyl Crossbow (ACB): ${BT}675M${BT}
          - Rune Crossbow or better: 850M
          - Additional cost for lower than 94 Mage: 50M

          **- 6 Jad Challenge**
          - Twisted Bow (Tbow): ${BT}100M${BT}
          - Toxic Blowpipe (BP): ${BT}125M${BT}
        `,
      },
      {
        name: 'Chambers of Xeric',
        emoji: '🐉',
        message: [
          dedent`
            **- COX - Trio**
            You keep all loot.
            Prices may vary depending on stats and gear

            - Trio: ${BT}9M${BT}

            **- COX - Challenge Mode - CM**
            You keep all loot.
            Prices may vary depending on stats and gear

            - Challenge Mode - Mass: ${BT}20M${BT}
            - Challenge Mode - 3-5: ${BT}25M${BT}

            **- COX Solo**
            You keep all loot.
            Prices may vary depending on stats and gear

            - Twisted Bow (TBow): ${BT}10M${BT}
            - Bow of Faerdhinen (Bowfa): ${BT}12M${BT}
            - Tentacle Whip/Toxic Blowpipe (BP): ${BT}14M${BT}
            - 61-69 Range: ${BT}35M${BT}

            **- Scaled Cox**
            Additional costs:
            Tentacle whip or worse +5m
            No bowfa or tbow + 5m
            Not able to make strong overloads +15m
            No chins +15m
            10% Increase if low combat.

            - 3+28: ${BT}300M${BT}
            - 3+28 Megascale: ${BT}300M${BT}
            - 3+28 Megascale Untill A Purple: ${BT}750M${BT}
            - 3+12: ${BT}60M${BT}

            ****- COX Bundles****
            All the bundle discounts stacked with your discount rank.

            - (5% off for 10kc or more): ${BT}NaN${BT}
            - (10% off for 50kc or more): ${BT}NaN${BT}
          `,
          dedent`
            Tu consegue por outras páginas dessa forma.
          `,
        ],
      },
    ],
  },
};
