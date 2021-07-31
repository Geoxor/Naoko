import config from "../classes/Config.sakuria";
import Discord from "discord.js";
import MessageParser from "../classes/MessageParser.sakuria";
import { IMessage } from "../types";

/**
 * returns the function if the message doesn't meet requirements
 * or if the message is by a bot and it parsers the message
 * content and appends the args and command to it
 * @param {Discord.Message} message 
 * @param {Function} next
 * @author Geoxor
 */
export default function (message: Discord.Message, next: Function): void {
  if (!message.content.toLowerCase().startsWith(config.prefix)) return;
  if (message.author.bot) return;
  const { command, args } = new MessageParser(message.content);
  const updatedMessage = message as IMessage;
  updatedMessage.command = command.toLowerCase();
  updatedMessage.args = args.map((arg) => arg.toLowerCase());
  next(updatedMessage);
}
