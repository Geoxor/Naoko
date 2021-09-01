import Discord, { Intents } from "discord.js";
import { ICommand } from "../types";
import logger from "./Logger.sakuria";
import { commands } from "../commands";
import config from "./Config.sakuria";
import { version } from "../../package.json";
import si from "systeminformation";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";

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
  public slashCommands: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">[];
  private rest: REST;
  public CLIENT_ID: string = "870496144881492069";
  public DEV_SERVER_ID: string = "385387666415550474";

  constructor() {
    logger.sakuria.print("Instantiated Discord client instance");
    this.rest = new REST({ version: "9" }).setToken(config.TOKEN);

    this.commands = new Discord.Collection();
    this.loadCommands();

    // Get the slash command data from the command object
    this.slashCommands = this.commands.map((command) => command.data);
    this.registerSlashCommands();

    this.bot = new Discord.Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
    });
    logger.sakuria.print("Sakuria logging in...");
    this.bot.login(config.TOKEN);
    this.bot.once("ready", async () => {
      this.onReady();
      logger.sakuria.print(`Currently in ${this.bot.guilds.cache.size} servers`);
      this.bot.user?.setActivity(`/help v${version}`, { type: "LISTENING" });
    });
    // this.bot.on("messageCreate", (message) => this.onMessageCreate(message));
    this.bot.on("interactionCreate", async (interaction) => this.onInteractionCreate(interaction));
  }

  /**
   * Loads all the command files from ./commands
   */
  private loadCommands() {
    logger.sakuria.print("Loading commands...");

    for (const command of commands) {
      if (command.data?.name) {
        this.commands.set(command.data.name, command);
        logger.sakuria.print(`┖ Imported command ${command.data.name}`);
      }
    }
  }

  private async registerSlashCommands() {
    const commandsJSON = this.slashCommands.map((command) => command.toJSON());

    try {
      logger.command.print("Started refreshing global application (/) commands.");
      await this.rest.put(Routes.applicationCommands(this.CLIENT_ID), { body: commandsJSON });
      logger.command.print(
        `Successfully reloaded ${this.slashCommands.length} global application (/) commands.`
      );
    } catch (error) {
      console.log(error);
    }

    try {
      logger.command.print("Started refreshing dev server application (/) commands.");
      await this.rest.put(Routes.applicationGuildCommands(this.CLIENT_ID, this.DEV_SERVER_ID), {
        body: commandsJSON,
      });
      logger.command.print(
        `Successfully reloaded ${this.slashCommands.length} dev server application (/) commands.`
      );
    } catch (error) {
      console.log(error);
    }
  }

  private onReady() {
    logger.sakuria.print(`Logged in as ${this.bot.user!.tag}!`);
  }

  private async onInteractionCreate(interaction: Discord.Interaction) {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    const command = this.commands.get(commandName);

    if (!command) return;

    try {
      command.requiresProcessing && (await interaction.deferReply());
    } catch (error) {
      return
    }

    try {
      let timeStart = Date.now();
      var result = await command.execute(interaction);
      let timeEnd = Date.now();
      logger.command.executedCommand(
        timeEnd - timeStart,
        command.data.name,
        interaction.user.username,
        interaction.guild?.name || "dm"
      );
    } catch (error) {
      if (error) result = error.toString();
    }

    if (!result) return;


    try {
      command.requiresProcessing && (await interaction.editReply(result).catch((err) => console.log(err)));
      !command.requiresProcessing && (await interaction.reply(result).catch((err) => console.log(err)));
      return;
    } catch (error) {
      return;
    }
  }
}

export default new Sakuria();
