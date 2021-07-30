import Discord from 'discord.js';
import MessageParser from './MessageParser.sakuria';
import filterForSakuriaCommands from '../middleware/filterForSakuriaCommands.sakuria';

interface IMessage extends Discord.Message {
  command: string;
  args: string[];
}

export default class Sakuria {
  private bot: Discord.Client;

  constructor(){
    this.bot = new Discord.Client();
    this.bot.on('ready', () => this.onReady);
    this.bot.on('message', message => this.onMessage(message));
    this.bot.login(process.env.DISCORD_TOKEN!);
  }

  private onReady(){
    console.log(`Logged in as ${this.bot.user!.tag}!`);
  }

  private onMessage(message: Discord.Message){
    filterForSakuriaCommands(message, () => {
      const { command, args } = new MessageParser(message.content);
      (message as IMessage).command = command;
      (message as IMessage).args = args;
      

      console.log(message);
    });
  }
}