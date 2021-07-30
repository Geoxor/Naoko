import config from "../classes/Config.sakuria";
import Discord from 'discord.js';
import MessageParser from "../classes/MessageParser.sakuria";
import { IMessage } from "../types";

export default function(message: Discord.Message, next: Function): void {
  if (!message.content.startsWith(config.prefix)) return;
  if (message.author.bot) return;
  const { command, args } = new MessageParser(message.content);
  (message as IMessage).command = command.toLowerCase();
  (message as IMessage).args = args.map(arg => arg.toLowerCase());
  next(message as IMessage);
}