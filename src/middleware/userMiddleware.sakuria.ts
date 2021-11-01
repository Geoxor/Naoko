import Discord from "discord.js";
import { User } from "../sakuria/Database.sakuria";
import { IMessage } from "../types";
import logger from "../sakuria/Logger.sakuria";

export async function userMiddleware(message: Discord.Message, next: (message: IMessage) => any): Promise<void> {
  let databaseUser = await User.findOne({discord_id: message.author.id});
  if (!databaseUser) {
    logger.sakuria.print(`Created new user in DB ${message.member?.user.username}`);
    databaseUser = await new User({
      discord_id: message.author.id,
      roles: Array.from(message.member?.roles.cache.keys() || []),
      joined_at: message.member?.joinedTimestamp,
      account_created_at: message.author.createdTimestamp,
    }).save();
  };

  (message as IMessage).databaseUser = databaseUser

  next(message as IMessage);
}