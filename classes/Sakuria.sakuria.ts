import Discord, { Intents } from "discord.js";
import filterForSakuriaCommands from "../middleware/filterForCommands.sakuria";
import { ICommand, IMessage } from "../types";
import fs from "fs";
import logger from "../classes/Logger.sakuria";

/**
 * Sakuria multi purpose Discord bot
 * @author Geoxor, Cimok
 */
export default class Sakuria {
  private bot: Discord.Client;
  private commands: Discord.Collection<string, ICommand>;

  constructor() {
    this.bot = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
    this.bot.on("ready", () => {
      this.onReady;
    });
    this.bot.on("message", (message) => this.onMessage(message));
    this.commands = new Discord.Collection();
    this.loadCommands();
    this.bot.login(process.env.DISCORD_TOKEN!);
  }

  /**
   * Loads all the command files from ./commands
   */
  private loadCommands() {
    logger.sakuria.loadingCommands();

    const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".ts"));

    for (const file of commandFiles) {
      const command = require(`../commands/${file}`).command as ICommand;
      this.commands.set(command.name, command);
      logger.sakuria.importedCommand(command.name);
    }
  }

  // onMessage handler, doesn't work apparently
  private onReady() {
    console.log(`Logged in as ${this.bot.user!.tag}!`);
  }

  // onMessage handler
  private onMessage(message: Discord.Message) {
    filterForSakuriaCommands(message, async (message: IMessage) => {
      // Slurs for idiots
      const slurs = ["idiot", "baka", "mennn", "cunt", "noob", "scrub", "fucker", "you dumb fucking twat"];

      // Fetch the command
      const command = this.commands.get(message.command);

      // If it doesn't exist we respond
      if (!command) return message.reply(`that command doesn't exist ${slurs[~~(Math.random() * slurs.length)]}`);

      // Notify the user their shit's processing
      if (command.requiresProcessing) {
        var processingMessage = await message.channel.send("Processing...");
        message.channel.startTyping();
      }

      // Get the result to send from the command
      const result = await command.execute(message);
      logger.command.executedCommand(command.name);

      // Delete the processing message if it exists
      // @ts-ignore
      if (processingMessage) {
        processingMessage.delete();
        message.channel.stopTyping();
      }

      // Send the result
      message.reply(result);
    });
  }
}
