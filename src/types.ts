import Discord, { ColorResolvable, CommandInteraction, EmbedFieldData, Interaction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export type Coords = {
  x?: number;
  y?: number;
  z?: number;
};
export type ImageProcessorFn = (buffer: Buffer, ...args: any) => Promise<Buffer>;
export interface ImageProcessors {
  [key: string]: ImageProcessorFn;
}
export interface IMessage extends Discord.Message {
  command: string;
  args: string[];
}

export type CommandExecute = (
  interaction: CommandInteraction
) => Promise<string | Discord.ReplyMessageOptions | void> | Discord.ReplyMessageOptions | string | void;

export interface ICommand {
  execute: CommandExecute;
  requiresProcessing?: boolean;
  type: CommandType;
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
}

export enum CommandType {
  ECONOMY = "Economy",
  FUN = "Fun",
  IMAGE_PROCESSORS = "Image Processors",
  MODERATION = "Moderation",
  MUSIC_PLAYER = "Music Player",
  UTILITY = "Utility",
}

export interface ISakuriaEmbed {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: Date | number;
  color?: ColorResolvable;
  footer?: { text: string; iconURL?: string } | string;
  image?: string;
  thumbnail?: string;
  author?: { name: string; iconURL?: string; url?: string };
  fields?: EmbedFieldData[];
}

export const defineCommand = (cmd: ICommand): ICommand => cmd;

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

export interface GeometrySceneOptions {
  texture: Buffer;
  geometry: THREE.BufferGeometry | THREE.Object3D;
  rotation: Coords;
  camera?: Coords;
  shading?: boolean;
  width?: number;
  height?: number;
  fps?: number;
}
