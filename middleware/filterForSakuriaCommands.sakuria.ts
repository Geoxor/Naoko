import config from "../classes/Config.sakuria";
import Discord from 'discord.js';

export default function(message: Discord.Message, next: Function): void {
  if (!message.content.startsWith(config.prefix)) return;
  if (message.author.bot) return;
  next();
}