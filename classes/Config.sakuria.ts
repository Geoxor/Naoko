import fs from "fs";

interface IConfig {
  prefix: string;
}

class Config {
  config: IConfig;
  constructor(){
    this.config = require("../sakuria.json");
    if (!this.config) this.createNewConfig();
  }

  private async createNewConfig(){
    this.config = {
      prefix: "saku"
    };
    
    // save this.config as config.sakuria.json
    try {
      await fs.promises.writeFile("./config.sakuria.json", JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error(error);
    }
  }
}

const {config} = new Config();
export default config