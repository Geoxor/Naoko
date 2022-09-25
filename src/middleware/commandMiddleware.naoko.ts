import Discord from "discord.js";
import { SHAII_ID } from "../constants";
import { removeMentions } from "../logic/logic.naoko";
import config from "../naoko/Config.naoko";
import MessageParser from "../naoko/MessageParser.naoko";
import { IMessage } from "../types";

/**
 * Returns the function if the message doesn't meet requirements
 * or if the message is by a bot and it parsers the message
 * content and appends the args and command to it.
 * @param {Discord.Message} message
 * @param {CommandExecute} next
 * @author Geoxor
 */
export default function (message: Discord.Message, next: (message: IMessage) => any): void {
  if (message.content.lastIndexOf(config.prefix) !== 0) return;
  if (message.author.id === SHAII_ID) return;
  const { command, args } = new MessageParser(removeMentions(message.content));
  const updatedMessage = message as IMessage;
  updatedMessage.command = command.toLowerCase();
  updatedMessage.args = args;
  next(updatedMessage);
}
