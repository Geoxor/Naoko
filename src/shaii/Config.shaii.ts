import fs from "fs";
import logger from "./Logger.shaii";

interface IConfig {
  prefix: string;
  musicDirectory: string;
  token: string;
  mongo: string;
  chatLogChannel: string;
}

/**
 * The Config class responsible for handling config loading and saving
 * @author N1kO23
 */
class Config {
  // Initializes the config with default path
  private path: string = "../config.shaii.json";
  private config: IConfig = require(this.path);

  /**
   * Creates a new config object and loads the config.shaii.json file
   * @param path Path to the config file
   */
  constructor(path?: string) {
    path && (this.path = path);
    this.load();
  }

  /// GETTERS ///
  public get prefix(): string {
    return this.config.prefix;
  }
  public get musicDirectory(): string {
    return this.config.musicDirectory;
  }
  public get token(): string {
    return this.config.token;
  }
  public get mongo(): string {
    return this.config.mongo;
  }
  public get chatLogChannel(): string {
    return this.config.chatLogChannel;
  }

  /// SETTERS ///
  public set prefix(value: string) {
    this.config.prefix = value;
  }
  public set musicDirectory(value: string) {
    this.config.musicDirectory = value;
  }
  public set token(value: string) {
    this.config.token = value;
  }
  public set mongo(value: string) {
    this.config.mongo = value;
  }
  public set chatLogChannel(value: string) {
    this.config.chatLogChannel = value;
  }

  /**
   * Validates the config object
   * @param configToValidate Config object to validate
   * @throws Error if the config is invalid
   * @author N1kO23
   */
  private validateConfig(configToValidate?: IConfig): void {
    const config = configToValidate || this.config;
    if (!config.token) {
      throw new Error("Config: Login token is not defined");
    }
    if (!config.prefix) {
      throw new Error("Config: Prefix is not defined");
    }
    if (!config.mongo) {
      throw new Error("Config: MongoDB URL is not defined");
    }
    if (!config.chatLogChannel) {
      throw new Error("Config: ChatLog channel is not defined");
    }
  }

  /**
   * Saves the config to the config.shaii.json file
   * @author N1kO23
   */
  public save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.config, null, 2));
  }

  /**
   * Loads the config from the path, validates it and sets it to the config object
   * @author N1kO23
   */
  public load(): void {
    try {
      const conf = require(this.path);
      this.validateConfig(conf);
      this.config = conf;
    } catch (e: any) {
      logger.error(e);
    }
  }
}

// Eventually this should have proper instance handling
const config = new Config();
export default config;
