import Discord from "discord.js";
import mongoose from "mongoose";
import { ActionHistory, HistoryTypes, IBattleUserRewards, IUser } from "../types";
import config from "./Config.shaii";
import logger from "./Logger.shaii";
mongoose
  .connect(config.mongo)
  .then(() => logger.print("MongoDB Connected"))
  .catch((err: any) => console.error("MongoDB Connection Error:", err));
const { Schema } = mongoose;

const DB_NUMBER = { type: "Number", default: 0 };

const schema = new Schema<IUser>({
  discord_id: { type: "String", required: true },
  minecraft_username: { type: "String", required: false },
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
  mute(muter_id: string, mutee_id: string, duration?: string, reason?: string): Promise<IUser>;
  unmute(unmuter_id: string, unmutee_id: string, reason?: string): Promise<IUser>;
  kick(kicker_id: string, kickee_id: string, reason?: string): Promise<IUser>;
  ban(kicker_id: string, kickee_id: string, reason?: string): Promise<IUser>;
  unban(unbanner_id: string, unbannee_id: string, reason?: string): Promise<IUser>;
  updateRoles(roles: string[]): Promise<IUser>;
  pushHistory(historyType: HistoryTypes, user_id: string, value: string): Promise<IUser>;
  findOneOrCreate(member: Discord.GuildMember | Discord.PartialGuildMember): Promise<IUser & { _id: any }>;
}
schema.methods.updateRoles = function (roles: string[]) {
  this.roles = roles;
  // return this.save().catch();
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

schema.statics.mute = async function (
  muter_id: string,
  mutee_id: string,
  duration: string = "Infinity",
  reason: string = "No reason given"
) {
  const mutee = await User.findOne({ discord_id: mutee_id });
  if (!mutee) return;

  const mute: ActionHistory = {
    timestamp: Date.now(),
    casted_by: muter_id,
    duration,
    reason,
  };

  mutee.mute_history.push(mute);

  return mutee.save().catch((err: any) => logger.error(err));
};

schema.statics.unmute = async function (unmuter_id: string, unmutee_id: string, reason: string = "No reason given") {
  const unmutee = await User.findOne({ discord_id: unmutee_id });
  if (!unmutee) return;

  return unmutee.save().catch((err: any) => logger.error(err));
};

schema.statics.kick = async function (kicker_id: string, kickee_id: string, reason: string = "No reason given") {
  const kickee = await User.findOne({ discord_id: kickee_id });
  if (!kickee) return;

  const kick: ActionHistory = {
    timestamp: Date.now(),
    casted_by: kicker_id,
    reason,
  };

  kickee.kick_history.push(kick);

  return kickee.save().catch((err: any) => logger.error(err));
};

schema.statics.ban = async function (baner_id: string, banee_id: string, reason: string = "No reason given") {
  const banee = await User.findOne({ discord_id: banee_id });
  if (!banee) return;

  const ban: ActionHistory = {
    timestamp: Date.now(),
    casted_by: baner_id,
    reason,
  };

  banee.ban_history.push(ban);

  return banee.save().catch((err: any) => logger.error(err));
};

schema.statics.unban = async function (unbanner_id: string, unbannee_id: string, reason: string = "No reason given") {
  const unbannee = await User.findOne({ discord_id: unbannee_id });
  if (!unbannee) return;

  unbannee.is_banned = false;

  return unbannee.save().catch((err: any) => logger.error(err));
};

schema.statics.pushHistory = async function (historyType: HistoryTypes, user_id: string, value: string) {
  const user = await User.findOne({ discord_id: user_id });
  if (!user) return;
  user[historyType].push({ timestamp: Date.now(), value });
  if (user[historyType].length > 50) user[historyType].shift();
  return user.save().catch((err: any) => logger.error(err));
};

// @ts-ignore
export const User: mongoose.Model<IUser, {}, {}, {}> & IUserFunctions = mongoose.model<IUser>("User", schema);
