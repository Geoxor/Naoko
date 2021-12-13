import Discord, { MessageEmbed } from "discord.js";
import mongoose from "mongoose";
import { Mongoose, Types, Document } from "mongoose";
import { IUserFunctions } from "./shaii/Database.shaii";
import {
  COMMAND_CATEGORIES_RAW,
  IWAIFU_RARITIES_NAME,
  IWAIFU_RARITIES_COLOR,
  IWAIFU_RARITIES_EMOJI,
  HISTORY_TYPES,
} from "./constants";
export type Coords = {
  x?: number;
  y?: number;
  z?: number;
};
export type TextProcessorFn = (sentence: string, ...args: any) => Promise<string>;
export interface TextProcessors {
  [key: string]: TextProcessorFn;
}

export type ImageProcessorFn = (buffer: Buffer, ...args: any) => Promise<Buffer>;
export interface ImageProcessors {
  [key: string]: ImageProcessorFn;
}

export interface History {
  timestamp: number;
  value: string;
}

export type HistoryTypes = typeof HISTORY_TYPES[number];

export interface ActionHistory {
  timestamp: number;
  casted_by: string;
  reason: string;
}

export interface IUser extends mongoose.Document, IUserFunctions {
  discord_id: String;

  kick_history: ActionHistory[];
  mute_history: ActionHistory[];
  ban_history: ActionHistory[];
  bonk_history: ActionHistory[];

  status_history: History[];
  username_history: History[];
  nickname_history: History[];

  chat_xp: number;
  bonks: number;
  is_muted: Boolean;
  is_banned: Boolean;
  roles: string[];
  joined_at: number;
  account_created_at: number;
  inventory: IGameInventory;
  statistics: IGameStatistics;
}

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

export interface IMessage extends Discord.Message {
  command: string;
  args: string[];
  databaseUser: DatabaseUser;
}

export type DatabaseUser = Document<any, any, IUser> &
  IUser & {
    _id: Types.ObjectId;
  };

export type CommandExecute = (
  message: IMessage
) => Promise<string | Discord.ReplyMessageOptions | void> | Discord.ReplyMessageOptions | string | void;

export type CommandCategories = typeof COMMAND_CATEGORIES_RAW[number];

export interface ICommand {
  /**
   * The handler associated with this command
   */
  execute: CommandExecute;
  /**
   * The name of the command
   */
  name: string;
  /**
   * The description of the command
   */
  description: string;
  /**
   * The syntactic way the command should be used as
   */
  usage: string;
  /**
   * The category type the command belongs to, e.g. "FUN" or "MODERATION"
   */
  category: CommandCategories;
  /**
   * Alternative ways to call this command
   */
  aliases: string[];
  /**
   * Permissions the user needs to have to run this command
   */
  permissions?: Discord.PermissionResolvable[];
  /**
   * This will send 'processing...' if set to true, (useful for commands that take long to complete asyncronous tasks)
   */
  requiresProcessing?: boolean;
}

export const defineCommand = (cmd: ICommand): ICommand => cmd;

export interface CommandInput {
  type: void; // actually, it should be: text | link | sticker | image | video | sound | file | embed | error
  contents: string | File | MessageEmbed;
  command: ICommand;
  nextCommand?: CommandInput;
  message: Discord.Message;
}

export interface CommandOutput {
  type: void; // actually, it should be: text | link | sticker | image | video | sound | file | embed | error
  contents: string | File | MessageEmbed;
  command: ICommand;
  nextCommand?: CommandInput;
  message: Discord.Message;
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

export type IWaifuRarityName = typeof IWAIFU_RARITIES_NAME[number];
export type IWaifuRarityColor = typeof IWAIFU_RARITIES_COLOR[number];
export type IWaifuRarityEmoji = typeof IWAIFU_RARITIES_EMOJI[number];

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
