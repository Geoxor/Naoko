import quotes from "../assets/quotes.json";
import chalk from "chalk";
import { getCurrentMemoryHeap } from "../logic/logic.sakuria";
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

  constructor() {
    this.emoji = "🌸";
    this.color = "#FF90E0";
    this.errorEmoji = "👺";
    this.errorColor = "#F03A17";
  }

  /**
   * Returns a the current time for the log to prefix
   * @author Geoxor
   */
  public time() {
    return chalk.bold.bgWhite.black(`[${new Date().toLocaleTimeString()}]`);
  }

  /**
   * prints a log to the console with colors and an emoji
   * @param log the message to print
   * @author Geoxor
   */
  public print(log: string): void {
    console.log(chalk.hex(this.color)(`  ${getCurrentMemoryHeap()}  ${this.time()} ${this.emoji}  ${log}`));
  }

  /**
   * prints an error to the console in red with a goblin
   * @param log the error to print
   * @author Geoxor
   */
  public error(log: string): void {
    console.log(chalk.hex(this.errorColor)(`  ${this.time()} ${this.errorEmoji}  ${log}`));
  }
}
class SakuriaLogger extends Logger {
  public multiProgress: MultiProgress;

  constructor() {
    super();
    this.multiProgress = new MultiProgress(process.stdout);
  }
  public numServers = (numGuilds: number) => this.print(`Currently in ${numGuilds} servers`);
  public login = () => this.print("Sakuria logging in...");
  public instantiated = () => this.print("Instantiated Discord client instance");
  public creating = () => this.print("Creating new Sakuria instance...");
  public loadingCommands = () => this.print("Loading commands...");
  public importedCommand = (command: string) => this.print(`┖ Imported command ${command}`);
  public created = () => this.print("Sakuria created");
  public inspiration = () =>
    console.log(chalk.hex("#32343F")(`  ${quotes[~~(Math.random() * quotes.length - 1)]}\n`));
  public generic = (string: string) => console.log(`  ${getCurrentMemoryHeap()}  ${this.time()} 🗻  ${string}`);

  /**
   * Sets a progress bar
   */
  public progress(name: string, tickCount: number) {
    return this.multiProgress.newBar(`  ${chalk.green(name)} ${chalk.blue("[:bar]")} :percent `, {
      complete: "#",
      incomplete: "~",
      width: 96,
      total: tickCount,
    });
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
  public created = () => this.print("Created new sakuria.json config");
  public failedCreation = () => this.error("Failed to create sakuria.json config");
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
class PrismaLogger extends Logger {
  constructor() {
    super();
    this.emoji = "💎";
    this.color = "#31D2F7";
  }
  public loaded = () => this.print(`Prisma loaded`);
  public generic = (string: string) => this.print(string);
}

export default {
  config: new ConfigLogger(),
  sakuria: new SakuriaLogger(),
  command: new CommandLogger(),
  prisma: new PrismaLogger(),
};
