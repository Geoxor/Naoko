// import { PrismaClient } from "@prisma/client";
// import { IBattle } from "../types";
import logger from "./Logger.sakuria";
import mongoose from "mongoose";
import config from "./Config.sakuria";
import { IUser, IUserFunctions, Kick } from "../types";
mongoose.connect(config.mongo).then(() => console.log('connected'));
const { Schema } = mongoose;

const schema = new Schema<IUser>({
  // @ts-ignore
  discord_id: {type: String, required: true},
  // @ts-ignore
  xp: {type: Number, default: 0},
  // @ts-ignore
  bonks: {type: Number, default: 0},
  // @ts-ignore
  kick_history: {type: Array, default: []},
  // @ts-ignore
  is_muted: {type: Boolean, default: false},
  // @ts-ignore
  mute_history: {type: Array, default: []},
  // @ts-ignore
  is_banned: {type: Boolean, default: false},
  // @ts-ignore
  ban_history: {type: Array, default: []},
  // @ts-ignore
  bonk_history: {type: Array, default: []},
  // @ts-ignore
  roles: {type: Array, required: true},
  // @ts-ignore
  joined_at: {type: Number, required: true},
  // @ts-ignore
  account_created_at: {type: Number, required: true},
  // @ts-ignore
  previous_nicks: {type: Array, default: []},
  // @ts-ignore
  previous_usernames: {type: Array, default: []},
});

schema.methods.updateRoles = function (roles: string[]) {
  this.roles = roles;
  return this.save();
}

schema.statics.kick = async function (kicker_id: string, kickee_id: string, reason: string = "") {

  const kickee = await this.findOne({discord_id: kickee_id});
  if (!kickee) return;

  const kick: Kick = {
    timestamp: Date.now(),
    casted_by: kicker_id,
    reason,
  };

  kickee.kick_history.push(kick)

  return kickee.save().catch((err: any) => console.log(err));
};

// @ts-ignore
export const User: mongoose.Model<IUser, {}, {}, {}> & IUserFunctions = mongoose.model<IUser>("User", schema);