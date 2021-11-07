import Discord from "discord.js";
import { User } from "../sakuria/Database.sakuria";
import { IMessage } from "../types";
import logger from "../sakuria/Logger.sakuria";

export async function userMiddleware(
  message: Discord.Message,
  next: (message: IMessage) => any
): Promise<void> {
  if (message.member) {
    let databaseUser = await User.findOneOrCreate(message.member);
    (message as IMessage).databaseUser = databaseUser;
    next(message as IMessage);
  }
}
