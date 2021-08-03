import Discord, { Intents } from "discord.js";
import commandMiddleware from "../middleware/commandMiddleware.sakuria";
import { ICommand, IMessage } from "../types";
import logger from "../sakuria/Logger.sakuria";
import { commands } from "../commands";
import config from "./Config.sakuria";

/**
 * Sakuria multi purpose Discord bot
 * @author Geoxor, Cimok
 */
class Sakuria {
  private bot: Discord.Client;
  public commands: Discord.Collection<string, ICommand>;

  constructor() {
    this.commands = new Discord.Collection();
    this.loadCommands();
    this.bot = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
    logger.sakuria.instantiated();
    this.bot.on("ready", async () => {
      this.onReady;
      logger.sakuria.numServers(this.bot.guilds.cache.size);
      this.bot.user?.setActivity(`for ${config.prefix}help`, { type: 'LISTENING' })
    });
    this.bot.on("messageCreate", (message) => this.onMessageCreate(message));
    this.bot.login(process.env.DISCORD_TOKEN!);
    logger.sakuria.login();
  }

  /**
   * Loads all the command files from ./commands
   */
  private loadCommands() {
    logger.sakuria.loadingCommands();

    for (const command of commands) {
      this.commands.set(command.name, command);
      logger.sakuria.importedCommand(command.name);
    }
  }

  // onMessageCreate handler, doesn't work apparently
  private onReady() {
    console.log(`Logged in as ${this.bot.user!.tag}!`);
  }

  // onMessageCreate handler
  private onMessageCreate(message: Discord.Message) {
    commandMiddleware(message, async (message: IMessage) => {
      // Slurs for idiots
      const slurs = ["idiot", "baka", "mennn", "cunt", "noob", "scrub", "fucker", "you dumb fucking twat"];

      // Fetch the command
      const command = this.commands.get(message.command);

      // If it doesn't exist we respond
      if (!command) {
        message.reply(`that command doesn't exist ${slurs[~~(Math.random() * slurs.length)]}`);
        return;
      }

      // Notify the user their shit's processing
      if (command.requiresProcessing) {
        var processingMessage = await message.channel.send("Processing...");
        var typingInterval = setInterval(() => message.channel.sendTyping(), 4000);
      }

      // Get the result to send from the command
      const result = await command.execute(message);
      logger.command.executedCommand(command.name, message.author.username, message.guild?.name || "dm");

      // Delete the processing message if it exists
      // @ts-ignore
      if (processingMessage) {
        processingMessage.delete();
        // @ts-ignore
        clearInterval(typingInterval);
      }

      // Send the result
      try {
        await message.reply(result);
      } catch (error) {
        try {
          await message.channel.send(result);
        } catch (error) {
          console.log(error);
          await message.channel.send("⚠️ An error occured");
        }
      }
    });
  }
}

export default new Sakuria();
