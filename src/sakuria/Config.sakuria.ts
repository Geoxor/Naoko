import fs from "fs";
import logger from "./Logger.sakuria";

interface IConfig {
  prefix: string;
  musicDirectory: string;
  token: string;
}

class Config {
  config!: IConfig;
  constructor() {
    logger.config.loading();
    try {
      this.config = require("./sakuria.json");
      logger.config.loaded();
    } catch (error) {
      this.createNewConfig();
    }
  }

  private async createNewConfig() {
    logger.config.creating();

    this.config = {
      prefix: "~",
      musicDirectory: "./music",
      token: "ODcwNDk2MTQ0ODgxNDkyMDY5.YQNmtQ.cyDshM2z4T4NrtXVBEJf816mmM8",
    };

    // save this.config as config.sakuria.json
    try {
      await fs.promises.writeFile("./sakuria.json", JSON.stringify(this.config, null, 2));
      logger.config.created();
    } catch (error) {
      logger.config.failedCreation();
      console.error(error);
    }
  }
}

const { config } = new Config();
export default config;
