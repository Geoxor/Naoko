// import { IBattle } from "../types";
import logger from "./Logger.shaii";
import mongoose from "mongoose";
import config from "./Config.shaii";
import { IBattleUserRewards, IRewards, IUser, ActionHistory, HistoryTypes } from "../types";
import Discord from "discord.js";
mongoose.connect(config.mongo).then(() => console.log("connected"));
const { Schema } = mongoose;

const DB_NUMBER = { type: "Number", default: 0 };

const schema = new Schema<IUser>({
  discord_id: { type: "String", required: true },
  bonks: { type: "Number", default: 0 },
  chat_xp: { type: "Number", default: 0 },
  is_muted: { type: "Boolean", default: false },
  is_banned: { type: "Boolean", default: false },
  joined_at: { type: "Number", required: true },
  account_created_at: { type: "Number", required: true },
  statistics: {
    xp: DB_NUMBER,
    balance: DB_NUMBER,
    total_attacks: DB_NUMBER,
    total_damage_dealt: DB_NUMBER,
    total_prisms_collected: DB_NUMBER,
    total_prisms_spent: DB_NUMBER,
    waifu_types_killed: {
      common: DB_NUMBER,
      uncommon: DB_NUMBER,
      rare: DB_NUMBER,
      legendary: DB_NUMBER,
      mythical: DB_NUMBER,
    },
  },

  kick_history: Array,
  status_history: Array,
  mute_history: Array,
  ban_history: Array,
  bonk_history: Array,
  username_history: Array,
  roles: Array,
  nickname_history: Array,
});

export interface IUserFunctions {
  addBattleRewards(rewards: IBattleUserRewards): Promise<IUser>;
  kick(kicker_id: string, kickee_id: string, reason?: string): Promise<IUser>;
  ban(kicker_id: string, kickee_id: string, reason?: string): Promise<IUser>;
  updateRoles(roles: string[]): Promise<IUser>;
  pushHistory(historyType: HistoryTypes, user_id: string, value: string): Promise<IUser>;
  findOneOrCreate(member: Discord.GuildMember | Discord.PartialGuildMember): Promise<IUser & { _id: any }>;
}
schema.methods.updateRoles = function (roles: string[]) {
  this.roles = roles;
  return this.save();
};

schema.methods.addBattleRewards = function (rewards: IBattleUserRewards) {
  this.statistics.balance += rewards.money;
  this.statistics.xp += rewards.money;
  this.statistics.total_attacks += rewards.totalAttacks;
  this.statistics.total_damage_dealt += rewards.totalDamageDealt;
  this.statistics.waifu_types_killed[rewards.rarity]++;
  this.statistics.total_prisms_collected += rewards.money;

  return this.save();
};

schema.statics.findOneOrCreate = async function (member: Discord.GuildMember | Discord.PartialGuildMember) {
  let user = await User.findOne({ discord_id: member.id });

  if (!user) {
    const userData = {
      discord_id: member.id,
      roles: Array.from(member.roles.cache.keys() || []),
      joined_at: member.joinedTimestamp || Date.now(),
      account_created_at: member.user.createdTimestamp,
    };

    user = await new User(userData).save();
  }
  return user;
};

schema.statics.kick = async function (
  kicker_id: string,
  kickee_id: string,
  reason: string = "no reason given"
) {
  const kickee = await User.findOne({ discord_id: kickee_id });
  if (!kickee) return;

  const kick: ActionHistory = {
    timestamp: Date.now(),
    casted_by: kicker_id,
    reason,
  };

  kickee.kick_history.push(kick);

  return kickee.save().catch((err: any) => console.log(err));
};

schema.statics.ban = async function (baner_id: string, banee_id: string, reason: string = "no reason given") {
  const banee = await User.findOne({ discord_id: banee_id });
  if (!banee) return;

  const ban: ActionHistory = {
    timestamp: Date.now(),
    casted_by: baner_id,
    reason,
  };

  banee.ban_history.push(ban);

  return banee.save().catch((err: any) => console.log(err));
};

schema.statics.pushHistory = async function (historyType: HistoryTypes, user_id: string, value: string) {
  const user = await User.findOne({ discord_id: user_id });
  if (!user) return;
  user[historyType].push({ timestamp: Date.now(), value });
  return user.save().catch((err: any) => console.log(err));
};

// @ts-ignore
export const User: mongoose.Model<IUser, {}, {}, {}> & IUserFunctions = mongoose.model<IUser>("User", schema);
