import Discord from "discord.js";
import { User } from "../sakuria/Database.sakuria";
import { DatabaseUser, IMessage } from "../types";

export async function userMiddleware(message: Discord.Message, next: (message: IMessage) => any): Promise<void> {
  let databaseUser = await User.findOne({discord_id: message.author.id});
  if (!databaseUser) {
    databaseUser = await new User({
      discord_id: message.author.id,
      xp: 0,
      bonks: 0,
      kick_history: [],
      is_muted: false,
      mute_history: [],
      is_banned: false,
      ban_history: [],
      bonk_history: [],
      roles: [],
      joined_at: 0,
      account_created_at: 0,
      previous_nicks: [],
      previous_usernames: [],
    }).save();
  };

  (message as IMessage).databaseUser = databaseUser

  next(message as IMessage);
}