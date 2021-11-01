import Discord from "discord.js";
import mongoose from "mongoose";
import { Mongoose, Types, Document } from "mongoose";
export type Coords = {
  x?: number;
  y?: number;
  z?: number;
};
export type ImageProcessorFn = (buffer: Buffer, ...args: any) => Promise<Buffer>;
export interface ImageProcessors {
  [key: string]: ImageProcessorFn;
}

export interface Kick {
  timestamp: number;
  casted_by: string;
  reason: string;
}

export type Mute = Kick;
export type Ban = Kick;
export type Bonk = Kick;

export interface IUser extends mongoose.Document, IUserFunctions {
  discord_id: String,
  xp: Number,
  bonks: Number,
  kick_history: Kick[],
  mute_history: Mute[],
  is_muted: Boolean,
  is_banned: Boolean,
  ban_history: Ban[],
  bonk_history: Bonk[],
  roles: string[],
  joined_at: Number,
  account_created_at: Number,
  previous_nicks: string[],
  previous_usernames: string[],
}

export interface IUserFunctions {
  kick(kicker_id: string, kickee_id: string, reason?: string): Promise<IUser>;
  updateRoles(roles: string[]): Promise<IUser>;
}

export interface IMessage extends Discord.Message {
  command: string;
  args: string[];
  databaseUser: DatabaseUser;
}

export type DatabaseUser = (Document<any, any, IUser> & IUser & {
  _id: Types.ObjectId;
});

export type CommandExecute = (
  message: IMessage
) => Promise<string | Discord.ReplyMessageOptions | void> | Discord.ReplyMessageOptions | string | void;

export interface ICommand {
  execute: CommandExecute;
  name: string;
  description: string;
  requiresProcessing?: boolean;
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
