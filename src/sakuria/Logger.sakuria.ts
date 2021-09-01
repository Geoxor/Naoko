import quotes from "../assets/quotes.json";
import chalk from "chalk";
import MultiProgress from "multi-progress";
import { getCurrentMemoryHeap } from "../logic/formatters.sakuria";

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
    this.emoji = "[core]";
    this.color = "#676767";
    this.errorEmoji = "👺";
    this.errorColor = "#F03A17";
  }

  public inspiration = () => console.log(chalk.hex("#32343F")(`  ${quotes[~~(Math.random() * quotes.length - 1)]}\n`));

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
    console.log(chalk.hex(this.color)(`  ${getCurrentMemoryHeap()}  ${this.time()} ${this.emoji} ${log}`));
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

  /**
   * Sets a progress bar
   */
  public progress(name: string, tickCount: number) {
    return this.multiProgress.newBar(
      `  ${getCurrentMemoryHeap()}  ${this.time()} 🧪 ${chalk.hex("#00B294")(name)}${chalk.hex("#00B294")(
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
    this.emoji = "[config]";
    this.color = "#00B294";
  }
}
class CommandLogger extends Logger {
  constructor() {
    super();
    this.emoji = "[commands]";
    this.color = "#886CE4";
  }
  public executedCommand = (time: number, command: string, username: string, guild: string) =>
    this.print(`${time}ms - Executed command: ${command} - User: ${username} - Guild: ${guild}`);
}
class PrismaLogger extends Logger {
  constructor() {
    super();
    this.emoji = "[db]";
    this.color = "#31D2F7";
  }
}

export default {
  config: new ConfigLogger(),
  sakuria: new SakuriaLogger(),
  command: new CommandLogger(),
  prisma: new PrismaLogger(),
};
