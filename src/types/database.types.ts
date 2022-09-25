import mongoose, { Types, Document } from "mongoose";
import { IUserFunctions } from "../naoko/Database";
import { HISTORY_TYPES } from "../constants";
import { IGameInventory, IGameStatistics } from "./waifu.types";

export interface History {
  timestamp: number;
  value: string;
}

export type HistoryTypes = typeof HISTORY_TYPES[number];

export interface ActionHistory {
  timestamp: number;
  casted_by: string;
  duration?: string;
  reason: string;
}

export interface IUser extends mongoose.Document, IUserFunctions {
  discord_id: string;
  minecraft_username: string;

  kick_history: ActionHistory[];
  mute_history: ActionHistory[];
  ban_history: ActionHistory[];
  bonk_history: ActionHistory[];

  status_history: History[];
  username_history: History[];
  nickname_history: History[];

  chat_xp: number;
  bonks: number;
  is_muted: boolean;
  is_self_muted: boolean;
  is_banned: boolean;
  roles: string[];
  joined_at: number;
  account_created_at: number;
  inventory: IGameInventory;
  statistics: IGameStatistics;
}

export type DatabaseUser = Document<any, any, IUser> &
  IUser & {
    _id: Types.ObjectId;
  };
