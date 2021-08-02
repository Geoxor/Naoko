import config from "../classes/Config.sakuria";
import Discord from "discord.js";
import MessageParser from "../classes/MessageParser.sakuria";
import { IMessage, TExecute } from "../types";

/**
 * returns the function if the message doesn't meet requirements
 * or if the message is by a bot and it parsers the message
 * content and appends the args and command to it
 * @param {Discord.Message} message
 * @param {TExecute} next
 * @author Geoxor
 */
export default function (message: Discord.Message, next: TExecute): void {
  if (message.content.lastIndexOf(config.prefix) !== 0) return;
  if ((message.channel.type as string) === "dm") return;
  if (message.author.bot) return;
  const { command, args } = new MessageParser(message.content);
  const updatedMessage = message as IMessage;
  updatedMessage.command = command.toLowerCase();
  updatedMessage.args = args;
  next(updatedMessage);
}
