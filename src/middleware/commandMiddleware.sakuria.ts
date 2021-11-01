import config from "../sakuria/Config.sakuria";
import Discord from "discord.js";
import MessageParser from "../sakuria/MessageParser.sakuria";
import { DatabaseUser, IMessage } from "../types";

/**
 * Returns the function if the message doesn't meet requirements
 * or if the message is by a bot and it parsers the message
 * content and appends the args and command to it
 * @param {Discord.Message} message
 * @param {CommandExecute} next
 * @author Geoxor
 */
export default function (message: Discord.Message, next: (message: IMessage & {databaseUser: DatabaseUser}) => any): void {
  if (message.content.lastIndexOf(config.prefix) !== 0) return;
  if (message.author.bot) return;
  if (message.channelId === "845328432715923487") return;
  const { command, args } = new MessageParser(message.content);
  const updatedMessage = message as IMessage;
  updatedMessage.command = command.toLowerCase();
  updatedMessage.args = args;
  //@ts-ignore
  next(updatedMessage);
}
