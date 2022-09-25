import chalk from "chalk";
import MultiProgress from "multi-progress";
import quotes from "../assets/quotes.json";
import { getCurrentMemoryHeap, randomChoice } from "../logic/logic";

/**
 * Main logging wrapper that creates beautiful colors and emojis
 * for logging what the bot is currently doing
 * @author Geoxor
 */
class Logger {
  private emoji: string = "🌸";
  private color: string = "#FF90E0";
  private errorColor: string = "#FF0";
  private errorEmoji: string = "⚠";
  public logHistory: string[] = [];
  public multiProgress: MultiProgress = new MultiProgress(process.stdout);

  public inspiration = () => console.log(chalk.hex("#32343F")(`  ${randomChoice(quotes)}\n`));

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

  /**
   * Sets a progress bar
   */
  public progress(name: string, tickCount: number) {
    return this.multiProgress.newBar(
      `  ${getCurrentMemoryHeap()}  ${this.timeColored()} ${this.emoji} ${chalk.hex(this.color)(name)}${chalk.hex(
        this.color
      )("[:bar]")} :etas :percent `,
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

export const logger = new Logger();
