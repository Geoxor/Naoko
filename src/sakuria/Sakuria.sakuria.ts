import Discord, { Intents } from "discord.js";
import commandMiddleware from "../middleware/commandMiddleware.sakuria";
import moderationMiddleware from "../middleware/moderationMiddleware.sakuria";
import { logDelete, logEdit } from "../middleware/messageLoggerMiddleware.sakuria";
import { ICommand, IMessage } from "../types";
import logger from "./Logger.sakuria";
import { commands } from "../commands";
import config from "./Config.sakuria";
import { version } from "../../package.json";
import si from "systeminformation";

export let systemInfo: si.Systeminformation.StaticData;
logger.config.print("Fetching environment information...");
si.getStaticData().then((info) => {
  logger.config.print("Environment info fetched");
  systemInfo = info;
});

/**
 * Sakuria multi purpose Discord bot
 * @author Geoxor, Cimok
 */
class Sakuria {
  public bot: Discord.Client;
  public commands: Discord.Collection<string, ICommand>;

  constructor() {
    this.commands = new Discord.Collection();
    this.loadCommands();
    this.bot = new Discord.Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
    });
    logger.sakuria.instantiated();
    this.bot.on("ready", async () => {
      this.onReady;
      logger.sakuria.numServers(this.bot.guilds.cache.size);
      this.bot.user?.setActivity(`${config.prefix}help v${version}`, { type: "LISTENING" });
    });
    this.bot.on("messageCreate", this.onMessageCreate);
    this.bot.on("messageUpdate", this.onMessageUpdate);
    this.bot.on("messageDelete", this.onMessageDelete);
    this.bot.login(config.token);
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

  private onMessageUpdate(oldMessage: Discord.Message | Discord.PartialMessage, newMessage: Discord.Message | Discord.PartialMessage) {
    logEdit(oldMessage, newMessage, (oldMessage, newMessage) => {

    });
  };

  private onMessageDelete(message: Discord.Message | Discord.PartialMessage) {
    logDelete(message, (message) => {

    });
  };

  // onMessageCreate handler
  private onMessageCreate(message: Discord.Message) {
    moderationMiddleware(message, (message: Discord.Message) => {
      commandMiddleware(message, async (message: IMessage) => {
        // Slurs for idiots
        const slurs = ["idiot", "baka", "mennn", "cunt", "noob", "scrub", "fucker", "you dumb fucking twat"];

        // Fetch the command
        const command = this.commands.get(message.command);

        // If it doesn't exist we respond
        if (!command) {
          message.reply(`That command doesn't exist ${slurs[~~(Math.random() * slurs.length)]}`);
          return;
        }

        // Notify the user their shit's processing
        if (command.requiresProcessing) {
          var processingMessage = await message.channel.send("Processing...");
          var typingInterval = setInterval(() => message.channel.sendTyping(), 4000);
        }

        // Get the result to send from the command
        try {
          let timeStart = Date.now();
          var result = await command.execute(message);
          let timeEnd = Date.now();
          logger.command.executedCommand(
            timeEnd - timeStart,
            command.name,
            message.author.username,
            message.guild?.name || "dm"
          );
        } catch (error: any) {
          console.log(error);
          await message.reply(`\`\`\`${error}\`\`\``);
        }

        // Delete the processing message if it exists
        // @ts-ignore
        if (processingMessage) {
          processingMessage.delete();
          // @ts-ignore
          clearInterval(typingInterval);
        }

        // If the command returns void we just return
        if (!result) return;

        // Send the result
        try {
          await message.reply(result);
        } catch (error: any) {
          try {
            await message.channel.send(result);
          } catch (error: any) {
            console.log(error);
            if (error.code === 500) await message.reply("⚠️ when the upload speed");
            else await message.reply(`\`\`\`${error}\`\`\``);
          }
        }
      });
    });
  }
}

export default new Sakuria();