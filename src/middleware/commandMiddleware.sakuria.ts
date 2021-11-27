import config from "../sakuria/Config.sakuria";
import Discord from "discord.js";
import MessageParser from "../sakuria/MessageParser.sakuria";
import { IMessage } from "../types";
import { GEOXOR_GENERAL_CHANNEL_ID, GEOXOR_ID } from "../constants";

/**
 * Returns the function if the message doesn't meet requirements
 * or if the message is by a bot and it parsers the message
 * content and appends the args and command to it
 * @param {Discord.Message} message
 * @param {CommandExecute} next
 * @author Geoxor
 */
export default function (message: Discord.Message, next: (message: IMessage) => any): void {
  if (message.content.lastIndexOf(config.prefix) !== 0) return;
  if (message.author.bot) return;
  // if (message.channel.id === GEOXOR_GENERAL_CHANNEL_ID && message.author.id !== GEOXOR_ID) return;
  const { command, args } = new MessageParser(message.content);
  const updatedMessage = message as IMessage;
  updatedMessage.command = command.toLowerCase();
  updatedMessage.args = args;
  next(updatedMessage);
}
