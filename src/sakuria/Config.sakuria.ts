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
    this.config = {
      prefix: "~",
      musicDirectory: "./music",
      token: "ODcwNDk2MTQ0ODgxNDkyMDY5.YQNmtQ.ucXqGrpEDj8twKtQXqrmJK2-6Bk",
    };
  }
}

const { config } = new Config();
export default config;
