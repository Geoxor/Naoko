import Discord from "discord.js";

export type ImageProcessorFn = (buffer: Buffer) => Promise<Buffer>
export interface ImageProcessors { [key: string]: ImageProcessorFn };
export interface IMessage extends Discord.Message {
  command: string;
  args: string[];
}
export type CommandExecute = (
  message: IMessage
) => Promise<string | Discord.ReplyMessageOptions | void> | Discord.ReplyMessageOptions | string | void;
export interface ICommand {
  execute: CommandExecute;
  name: string;
  description: string;
  requiresProcessing?: boolean;
}
export interface IAnime {
  anilist: number;
  filename: string;
  episode?: number;
  from: number;
  to: number;
  similarity: number;
  video: string;
  image: string;
}
export interface CoverImage {
  large: string;
}
export interface Title {
  romaji: string;
  native: string;
}
export interface ExternalLinks {
  url: string;
}
export interface IAnilistAnime {
  id: number;
  description: string;
  coverImage: CoverImage;
  title: Title;
  externalLinks: ExternalLinks[];
  bannerImage?: string;
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
export type IWaifuRarityColor = "#8F93A2" | "#BDDE86" | "#C792EA" | "#FFCB6B" | "#F07178";
export type IWaifuRarityEmoji = "👺" | "🐉" | "🔮" | "🌟" | "⚜️";
