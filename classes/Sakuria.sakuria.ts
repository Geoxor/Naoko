import Discord from 'discord.js';
import config from "./Config.sakuria";

import MessageParser from './MessageParser.sakuria';

export default class Sakuria {
  private bot: Discord.Client;
  public prefix: string;

  constructor(){
    this.bot = new Discord.Client();
    this.prefix = '';
    this.bot.on('ready', () => this.onReady);
    this.bot.on('message', message => this.onMessage(message));
    this.bot.login(process.env.DISCORD_TOKEN!);
  }

  private onReady(){
    console.log(`Logged in as ${this.bot.user!.tag}!`);
  }

  private onMessage(message: Discord.Message){
    if (message.content.startsWith(config.prefix)) {
      const { command, args } = new MessageParser(message.content);
      console.log(command, args);
    }
  }
}