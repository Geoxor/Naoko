export interface IGameInventory {
  [key: string]: any;
}

export interface IGameStatistics {
  balance: number;
  xp: number;
  waifu_types_killed: IWaifuTypesKilled;
  total_attacks: number;
  total_damage_dealt: number;
  total_prisms_collected: number;
  total_prisms_spent: number;
}

export interface IWaifuTypesKilled {
  common: number;
  uncommon: number;
  rare: number;
  legendary: number;
  mythical: number;
}

export interface IWaifuRarity {
  relativeFrequency: number;
  rewards: IRewards;
  armor: number;
  hp: number;
  waifus: IWaifu[];
  name: IWaifuRarityName;
  color: IWaifuRarityColor;
  emoji: IWaifuRarityEmoji;
}
export interface IRewards {
  money: number;
  xp: number;
}

export interface IBattleUserRewards extends IRewards {
  totalAttacks: number;
  totalDamageDealt: number;
  rarity: IWaifuRarityName;
}

export interface IWaifu {
  name: string;
  image: string;
}
export interface IBattle extends IRewards {
  rarity: IWaifuRarityName;
  totalAttacks: number;
  totalDamageDealt: number;
}

export type IWaifuRarityName = "common" | "uncommon" | "rare" | "legendary" | "mythical";
//export type IWaifuRarityName = typeof IWAIFU_RARITIES_NAME[number];
export type IWaifuRarityColor = "#8F93A2" | "#BDDE86" | "#C792EA" | "#FFCB6B" | "#F07178";
export type IWaifuRarityEmoji = "👺" | "🐉" | "🔮" | "🌟" | "⚜️";
