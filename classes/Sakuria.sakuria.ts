import Discord, { Intents } from 'discord.js';
import filterForSakuriaCommands from '../middleware/filterForSakuriaCommands.sakuria';
import { Command, IMessage } from '../types';
import fs from 'fs';

export default class Sakuria {
  private bot: Discord.Client;
  private commands: Discord.Collection<string, Command>;

  constructor(){
    this.bot = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
    this.bot.on('ready', () => {
      this.onReady;
    });
    this.bot.on('message', message => this.onMessage(message));
    this.commands = new Discord.Collection();
    this.loadCommands();
    this.bot.login(process.env.DISCORD_TOKEN!);
  }

  private loadCommands(){
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.ts'));

    for (const file of commandFiles) {
      const command = require(`../commands/${file}`).command as Command;
      this.commands.set(command.name, command);
    }
  }

  private onReady(){
    console.log(`Logged in as ${this.bot.user!.tag}!`);
  }

  private onMessage(message: Discord.Message){
    filterForSakuriaCommands(message, async (message: IMessage) => {
      const command = this.commands.get(message.command);
      console.log(message.command);
      console.log(this.commands);
      if (!command) return message.reply("that command doesn't exist");
      command.execute(message);
    });
  }
}