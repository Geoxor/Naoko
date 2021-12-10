import quotes from "../assets/quotes.json";
import chalk from "chalk";
import { getCurrentMemoryHeap } from "../logic/logic.shaii";
import MultiProgress from "multi-progress";

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
  public logHistory: string[] = [];

  constructor() {
    this.emoji = "🌸";
    this.color = "#FF90E0";
    this.errorEmoji = "👺";
    this.errorColor = "#F03A17";
  }

  protected pushToLogHistory(string: string) {
    if (this.logHistory.length > 20) this.logHistory.shift();
    this.logHistory.push(string);
  }

  /**
   * Returns a the current time for the log to prefix
   * @author Geoxor
   */
  public timeColored() {
    return chalk.bold.bgWhite.black(this.time());
  }

  public time() {
    return new Date().toLocaleTimeString();
  }

  public getLogHistory() {
    return this.logHistory.join("\n");
  }

  /**
   * prints a log to the console with colors and an emoji
   * @param log the message to print
   * @author Geoxor
   */
  public print(log: string): void {
    this.pushToLogHistory(`${getCurrentMemoryHeap()}  [${this.time()}] ${this.emoji}  ${log}`);
    console.log(chalk.hex(this.color)(`  ${getCurrentMemoryHeap()}  ${this.timeColored()} ${this.emoji}  ${log}`));
  }

  /**
   * prints an error to the console in red with a goblin
   * @param log the error to print
   * @author Geoxor
   */
  public error(log: string): void {
    this.pushToLogHistory(`${getCurrentMemoryHeap()}  [${this.time()}] ${this.errorEmoji}  ${log}`);
    console.log(
      chalk.hex(this.errorColor)(`  ${getCurrentMemoryHeap()}  ${this.timeColored()} ${this.errorEmoji}  ${log}`)
    );
  }
}
class ShaiiLogger extends Logger {
  public multiProgress: MultiProgress;

  constructor() {
    super();
    this.multiProgress = new MultiProgress(process.stdout);
  }
  public numServers = (numGuilds: number) => this.print(`Currently in ${numGuilds} servers`);
  public login = () => this.print("Shaii logging in...");
  public instantiated = () => this.print("Instantiated Discord client instance");
  public creating = () => this.print("Creating new Shaii instance...");
  public loadingCommands = () => this.print("Loading commands...");
  public importedCommand = (command: string) => this.print(`┖ Imported command ${command}`);
  public created = () => this.print("Shaii created");
  public inspiration = () => console.log(chalk.hex("#32343F")(`  ${quotes[~~(Math.random() * quotes.length - 1)]}\n`));
  public generic = (string: string) => console.log(`  ${getCurrentMemoryHeap()}  ${this.timeColored()} 🗻  ${string}`);

  /**
   * Sets a progress bar
   */
  public progress(name: string, tickCount: number) {
    return this.multiProgress.newBar(
      `  ${getCurrentMemoryHeap()}  ${this.timeColored()} 🧪 ${chalk.hex("#00B294")(name)}${chalk.hex("#00B294")(
        "[:bar]"
      )} :etas :percent `,
      {
        complete: "#",
        incomplete: "~",
        width: 64,
        total: tickCount,
      }
    );
  }

  public setProgressValue(bar: ProgressBar, value: number) {
    bar.update(value);
    bar.tick();
  }
}
class ConfigLogger extends Logger {
  constructor() {
    super();
    this.emoji = "🧪";
    this.color = "#00B294";
  }
  public loading = () => this.print("Loading config...");
  public loaded = () => this.print("Config loaded");
  public creating = () => this.print("Creating new config...");
  public created = () => this.print("Created new shaii.json config");
  public failedCreation = () => this.error("Failed to create shaii.json config");
}
class CommandLogger extends Logger {
  constructor() {
    super();
    this.emoji = "🔮";
    this.color = "#886CE4";
  }
  public executedCommand = (time: number, command: string, username: string, guild: string) =>
    this.print(`${time}ms - Executed command: ${command} - User: ${username} - Guild: ${guild}`);
}

export default {
  config: new ConfigLogger(),
  shaii: new ShaiiLogger(),
  command: new CommandLogger(),
};
