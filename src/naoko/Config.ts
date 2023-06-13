import { Client, TextBasedChannel } from "discord.js";
import fs from "fs";
import { fileURLToPath } from "node:url";
import { GEOXOR_GENERAL_CHANNEL_ID, GEOXOR_STAFF_CHANNEL_ID, GEOXOR_CHAT_LOG_CHANNEL_ID, GEOXOR_LEAVE_LOG_CHANNEL_ID, GEOXOR_VOICE_CHAT_LOG_CHANNEL_ID } from "../constants";
import { singleton } from "@triptyk/tsyringe";

interface ConfigType {
  prefix: string;
  token: string;
  mongo: string;
  debug?: {
    overwriteChannel?: string,
  }
}

/**
 * The Config class responsible for handling config loading and saving
 * @author N1kO23
 */
@singleton()
export default class Config {
  // Initializes the config with default path
  private path: string = "../config.naoko.json";
  private config: ConfigType = ({} as any)/* = JSON.parse(readFileSync(this.path).toString())*/;

  private static readonly CHANNELS = {
    GEOXOR_GENERAL_CHANNEL_ID: GEOXOR_GENERAL_CHANNEL_ID,
    GEOXOR_STAFF_CHANNEL_ID: GEOXOR_STAFF_CHANNEL_ID,
    GEOXOR_CHAT_LOG_CHANNEL_ID: GEOXOR_CHAT_LOG_CHANNEL_ID,
    GEOXOR_LEAVE_LOG_CHANNEL_ID: GEOXOR_LEAVE_LOG_CHANNEL_ID,
    GEOXOR_VOICE_CHAT_LOG_CHANNEL_ID: GEOXOR_VOICE_CHAT_LOG_CHANNEL_ID,
  } as const;

  /**
   * Creates a new config object and loads the config.naoko.json file
   * @param path Path to the config file
   */
  constructor() {
    this.load();
  }

  public get prefix(): string {
    return this.config.prefix;
  }
  public get token(): string {
    return this.config.token;
  }
  public get mongo(): string {
    return this.config.mongo;
  }

  public getChannel(name: keyof typeof Config.CHANNELS , client: Client): TextBasedChannel {
    const channelId = this.config.debug?.overwriteChannel ? this.config.debug?.overwriteChannel : Config.CHANNELS[name];

    const channel = client.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error(`Could not find channel with Id: ${channelId}. If your on testing be sure to use debug.overwriteChannel config option`)
    }
    return channel;
  }

  /**
   * Loads the config from the path, validates it and sets it to the config object
   * @author N1kO23
   */
  public load(): void {
    try {
      const absolutePath = fileURLToPath(new URL(this.path, import.meta.url));
      const conf = JSON.parse(fs.readFileSync(absolutePath).toString());

      this.config = conf;
    } catch (e) {
      console.error("Failed to load config!", e);
    }
  }
}
