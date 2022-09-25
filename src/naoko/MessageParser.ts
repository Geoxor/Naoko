import { config } from "./Config";

export default class MessageParser {
  message: string;
  args: string[];
  command: string;

  constructor(message: string) {
    this.message = message;
    this.args = this.extractArgs(message);
    this.command = this.extractCommand();
  }

  extractArgs(message: string): string[] {
    return message.slice(config.prefix.length).trim().split(/ +/);
  }

  extractCommand(): string {
    return this.args.shift()!.toLowerCase();
  }
}
