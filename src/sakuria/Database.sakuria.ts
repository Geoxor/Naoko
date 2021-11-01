// import { PrismaClient } from "@prisma/client";
// import { IBattle } from "../types";
import logger from "./Logger.sakuria";
import mongoose from "mongoose";
import config from "./Config.sakuria";
import { IUser } from "../types";
mongoose.connect(config.mongo).then(() => console.log('connected'));
const { Schema } = mongoose;

const schema = new Schema<IUser>({
  discord_id: String,
  xp: Number,
  bonks: Number,
  kick_history: Array,
  is_muted: Boolean,
  mute_history: Array,
  is_banned: Boolean,
  ban_history: Array,
  bonk_history: Array,
  roles: Array,
  joined_at: Number,
  account_created_at: Number,
  previous_nicks: Array,
  previous_usernames: Array,
});

export const User = mongoose.model<IUser>("User", schema);

// /**
//  * Updates users last seen timestamp to the specified value or current time
//  * @param timestamp Users new last seen timestamp
//  */
//  schema.methods.updateUserLastSeen = async function (timestamp: number = Date.now()) {
//   this.last_seen = timestamp;
//   return this.save().catch((err) => console.log(err));
// };