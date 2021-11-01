interface IConfig {
  prefix: string;
  musicDirectory: string;
  token: string;
  chatLogChannel: string;
}

class Config {
  config!: IConfig;
  constructor() {
    this.config = {
      prefix: "~",
      musicDirectory: "./music",
      token: "ODcwNDk2MTQ0ODgxNDkyMDY5.YQNmtQ.ucXqGrpEDj8twKtQXqrmJK2-6Bk",
      chatLogChannel: "393914221693239298"
    };
  }
}

const { config } = new Config();
export default config;
