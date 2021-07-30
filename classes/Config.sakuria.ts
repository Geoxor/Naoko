import chalk from "chalk";
import fs from "fs";

interface IConfig {
  prefix: string;
}

class Config {
  config!: IConfig;
  constructor() {
    console.log(chalk.hex('#00B294')(`  🧪   Loading config...`));
    try {
      this.config = require("../sakuria.json");
      console.log(chalk.hex('#00B294')(`  🧪   Config loaded\n`));
    } catch (error) {
      this.createNewConfig();
    }
  }

  private async createNewConfig() {
    console.log(chalk.hex('#00B294')(`  🧪   Creating new config...`));

    this.config = {
      prefix: "~",
    };

    // save this.config as config.sakuria.json
    try {
      await fs.promises.writeFile("./sakuria.json", JSON.stringify(this.config, null, 2));
      console.log(chalk.hex('#00B294')(`  🧪   Created new sakuria.json config\n`));
    } catch (error) {
      console.log(chalk.hex('#F03A17')(`  👺   Failed to create sakuria.json config`));
      console.error(error);
    }
  }
}

const { config } = new Config();
export default config;
