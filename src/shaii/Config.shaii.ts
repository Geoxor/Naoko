import configTrolley from "../config.shaii.json";

interface IConfig {
  prefix: string;
  musicDirectory: string;
  token: string;
  mongo: string;
  chatLogChannel: string;
}
const config: IConfig = configTrolley;
export default config;
