import quotes from "../assets/quotes.json";
import chalk from "chalk";

/**
 * Main logging wrapper that creates beautiful colors and emojis
 * for logging what the bot is currently doing
 * @author Geoxor
 */
class Logger {
  protected emoji: string;
  protected color: string;
  private errorColor: "#F03A17";
  private errorEmoji: "👺";

  constructor() {
    this.emoji = "🌸";
    this.color = "#FF90E0";
    this.errorEmoji = "👺";
    this.errorColor = "#F03A17";
  }

  /**
   * prints a log to the console with colors and an emoji
   * @param log the message to print
   * @author Geoxor
   */
  public print(log: string): void {
    console.log(chalk.hex(this.color)(`  ${this.emoji}   ${log}`));
  }

  /**
   * prints an error to the console in red with a goblin
   * @param log the error to print
   * @author Geoxor
   */
  public error(log: string): void {
    console.log(chalk.hex(this.errorColor)(`  ${this.errorEmoji}   ${log}`));
  }
}

class SakuriaLogger extends Logger {
  constructor() {
    super();
  }

  /**
   * @example example print '🌸 Creating new Sakuria instance...'
   */
  public creating = () => this.print("Creating new Sakuria instance...");
  /**
   * @example example print '🌸 Loading commands...'
   */
  public loadingCommands = () => this.print("Loading commands...");
  /**
   * @example example print '🌸 ┖ Imported command ask'
   */
  public importedCommand = (command: string) => this.print(`┖ Imported command ${command}`);
  /**
   * @example example print '🌸 Sakuria created'
   */
  public created = () => this.print("Sakuria created\n");

  /**
   * Prints a random inspiraation quote
   * @example example print ` 
      We are all like fireworks: we climb, we shine and always go 
      our separate ways and become further apart. But even 
      when that time comes, let's not disappear like a firework 
      and continue to shine.. forever.`
   */
  public inspiration = () => console.log(chalk.hex("#32343F")(`  ${quotes[~~(Math.random() * quotes.length - 1)]}\n`));
}

class ConfigLogger extends Logger {
  constructor() {
    super();
    this.emoji = "🧪";
    this.color = "#00B294";
  }

  /**
   * @example example print '🧪 Loading config...'
   */
  public loading = () => this.print("Loading config...");

  /**
   * @example example print '🧪 Config loaded'
   */
  public loaded = () => this.print("Config loaded\n");

  /**
   * @example example print '🧪 Creating new config...'
   */
  public creating = () => this.print("Creating new config...");

  /**
   * @example example print '🧪 Created new sakuria.json config'
   */
  public created = () => this.print("Created new sakuria.json config\n");

  /**
   * @example example print '👺 Failed to create sakuria.json config'
   */
  public failedCreation = () => this.error("Failed to create sakuria.json config");
}

class CommandLogger extends Logger {
  constructor() {
    super();
    this.emoji = "🍵";
    this.color = "#D8E87A";
  }

  /**
   * @example example print '🍵 Executed command trace'
   */
  public executedCommand = (command: string) => this.print(`Executed command ${command}`);
}

export default {
  config: new ConfigLogger(),
  sakuria: new SakuriaLogger(),
  command: new CommandLogger(),
};
