import Discord, { Partials } from "discord.js";
import packageJson from "../../package.json" assert { type: 'json' };
import { SHAII_ID } from "../constants";
import { config } from "./Config";
import { User } from "./Database";
import { GatewayIntentBits } from 'discord.js';
import { singleton } from '@triptyk/tsyringe';
import { PluginManager } from "../plugins/PluginManager";
import MessageCreatePipelineManager from "../pipeline/messageCreate/MessageCreatePipelineManager";
import Logger from "./Logger";

/**
 * Naoko multi purpose Discord bot
 * @author Geoxor, Cimok
 */
@singleton()
export default class Naoko {
  public static version = packageJson.version;

  private static bot: Discord.Client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessageTyping,
    ],
    partials: [Partials.Channel],
  });

  constructor(
    private pluginManager: PluginManager,
    private messageCreatePipeline: MessageCreatePipelineManager,
    private logger: Logger,
  ) {}

  public async run(): Promise<void> {
    await this.registerEventListener();
    this.pluginManager.registerEventListener(Naoko.bot);

    this.logger.print("Naoko logging in...");
    await Naoko.bot.login(config.token);
  }

  private async registerEventListener() {
    Naoko.bot.on("ready", () => {
      this.logger.print(`Logged in as ${Naoko.bot.user!.tag}!`);
      this.logger.print(`Currently in ${Naoko.bot.guilds.cache.size} servers`);
      this.updateActivity();
      this.joinThreads();
    });
    Naoko.bot.on("messageCreate", async (message) => {
      await this.messageCreatePipeline.handleMessageCreate(message);
    });
  }

  private updateActivity() {
    Naoko.bot.user?.setActivity(`${config.prefix}help v${packageJson.version}`, { type: Discord.ActivityType.Listening });
  }

  private async joinThreads() {
    const channels = Naoko.bot.channels.cache.values();
    for (const channel of channels) {
      if (channel.isThread()) {
        // TODO: This was part of the Waifu battles. It can either be deleted 
        // or refactored in its one plugin, if we want the battle things again. I kinda liked them
        if (channel.ownerId === SHAII_ID) {
          await channel.delete();
          this.logger.print(`Deleted residual battle thread ${channel.id}`)
          continue;
        }

        await channel.join();
        this.logger.print(`Joined thread ${channel.id}`);
      }
    }
  }
}
