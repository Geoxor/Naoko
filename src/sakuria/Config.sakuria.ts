import fs from "fs";
import logger from "./Logger.sakuria";

interface IConfig {
  PREFIX: string;
  MUSIC_DIRECTORY: string;
  TOKEN: string;
  WAIFU_2X_PATH: string;
}

class Config {
  config!: IConfig;
  constructor() {
    logger.config.print("Loading config...");
    try {
      this.config = require("../sakuria.json");
      logger.config.print("Config loaded");
    } catch (error) {
      this.createNewConfig();
    }
  }

  private createNewConfig() {
    logger.config.print("Creating new config...");

    this.config = {
      PREFIX: "~",
      MUSIC_DIRECTORY: "./music",
      TOKEN: "",
      WAIFU_2X_PATH: "",
    };

    // save this.config as config.sakuria.json
    try {
      fs.writeFileSync("./src/sakuria.json", JSON.stringify(this.config, null, 2));
      logger.config.print("Created new sakuria.json config");
    } catch (error) {
      logger.config.print("Failed to create sakuria.json config");
      console.error(error);
    }
  }
}

const { config } = new Config();
export default config;
