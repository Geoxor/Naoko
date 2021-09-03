import quotes from "../assets/quotes.json";
import chalk from "chalk";
import MultiProgress from "multi-progress";
import { getCurrentMemoryHeap } from "../logic/formatters.sakuria";

type HexColor = `#${string}`;
type Prefix = `[${string}]`;

/**
 * Main logging wrapper that creates beautiful colors and prefixs
 * for logging what the bot is currently doing
 * @author Geoxor
 */
class Logger {
  private errorColor: HexColor = "#F03A17";
  private errorPrefix: Prefix = "[error]";
  public multiProgress: MultiProgress;
  public color: HexColor;
  public prefix: Prefix;

  constructor(prefix: Prefix, color: HexColor) {
    this.prefix = prefix;
    this.color = color;
    this.multiProgress = new MultiProgress(process.stdout);
  }

  public inspiration = () =>
    console.log(chalk.hex("#32343F")(`  ${quotes[~~(Math.random() * quotes.length - 1)]}\n`));

  /**
   * Returns a the current time for the log to prefix
   * @author Geoxor
   */
  public time() {
    return chalk.bold.bgWhite.black(`[${new Date().toLocaleTimeString()}]`);
  }

  /**
   * prints a log to the console with colors and an prefix
   * @param log the message to print
   * @author Geoxor
   */
  public print(log: string): void {
    console.log(chalk.hex(this.color)(`  ${getCurrentMemoryHeap()}  ${this.time()} ${this.prefix} ${log}`));
  }

  /**
   * prints an error to the console in red with a goblin
   * @param log the error to print
   * @author Geoxor
   */
  public error(log: string): void {
    console.log(chalk.hex(this.errorColor)(`  ${this.time()} ${this.errorPrefix}  ${log}`));
  }

  /**
   * Creates a new progress bar
   * @author Bluskript & Geoxor
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

  /**
   * Updates a progress bar
   * @author Bluskript & Geoxor
   */
  public setProgressValue(bar: ProgressBar, value: number) {
    bar.update(value);
    bar.tick();
  }

  /**
   * Prints the execute command
   * @param time the time the command took to execute
   * @param command the name of the command
   * @param username the username of the user who executed the command
   * @param guild the guild name the command was executed in
   * @returns {string}
   * @author Geoxor
   */
  public executedCommand = (time: number, command: string, username: string, guild: string) =>
    this.print(`${time}ms - Executed command: ${command} - User: ${username} - Guild: ${guild}`);
}

export default {
  sakuria: new Logger("[core]", "#676767"),
  config: new Logger("[config]", "#00B294"),
  command: new Logger("[commands]", "#886CE4"),
  prisma: new Logger("[db]", "#31D2F7"),
};
