import fs from "fs";

interface IConfig {
  prefix: string;
  musicDirectory: string;
  token: string;
  mongo: string;
  chatLogChannel: string;
}

class Config {
  config!: IConfig;
  constructor() {
    try {
      var configJSON = require("../config.sakuria.json");
    } catch (error) {
      console.log("you don't have a config set, please fill in your config.sakuria.json");
    }

    this.config = configJSON;
  }
}

const { config } = new Config();
export default config;
