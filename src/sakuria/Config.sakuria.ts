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
    this.config = {
      prefix: "~",
      musicDirectory: "X:/Repository/Music/nonbluskmusic",
      token: "ODcwNDk2MTQ0ODgxNDkyMDY5.YQNmtQ.ucXqGrpEDj8twKtQXqrmJK2-6Bk",
      chatLogChannel: "393914221693239298",
      mongo: "mongodb+srv://shaii:QEIg2vovIAm3sMyG@cluster0.bgxl7.mongodb.net/shaii?retryWrites=true&w=majority",
    };
  }
}

const { config } = new Config();
export default config;
