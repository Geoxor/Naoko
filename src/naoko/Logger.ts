import chalk from "chalk";
import MultiProgress from "multi-progress";
import quotes from "../assets/quotes.json" assert { type: 'json' };
import { singleton } from "@triptyk/tsyringe";
import CommonUtils from "../service/CommonUtils";

/**
 * Main logging wrapper that creates beautiful colors and emojis
 * for logging what the bot is currently doing
 * @author Geoxor
 */
@singleton()
export default class Logger {
  constructor(
    private commonUtils: CommonUtils,
  ) {}

  private emoji: string = "🌸";
  private color: string = "#FF90E0";
  private errorColor: string = "#FF0";
  private errorEmoji: string = "⚠";
  public logHistory: string[] = [];
  public multiProgress: MultiProgress = new MultiProgress(process.stdout);

  public inspiration = () => console.log(chalk.hex("#32343F")(`  ${this.commonUtils.randomChoice(quotes)}\n`));

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
    this.pushToLogHistory(`${this.getCurrentMemoryHeap()}  [${this.time()}] ${this.emoji}  ${log}`);
    console.log(chalk.hex(this.color)(`  ${this.getCurrentMemoryHeap()}  ${this.timeColored()} ${this.emoji}  ${log}`));
  }

  /**
   * prints an error to the console in red with a goblin
   * @param log the error to print
   * @author Geoxor
   */
  public error(log: string): void {
    this.pushToLogHistory(`${this.getCurrentMemoryHeap()}  [${this.time()}] ${this.errorEmoji}  ${log}`);
    console.log(
      chalk.hex(this.errorColor)(`  ${this.getCurrentMemoryHeap()}  ${this.timeColored()} ${this.errorEmoji}  ${log}`)
    );
  }

  /**
   * Sets a progress bar
   */
  public progress(name: string, tickCount: number) {
    return this.multiProgress.newBar(
      `  ${this.getCurrentMemoryHeap()}  ${this.timeColored()} ${this.emoji} ${chalk.hex(this.color)(name)}${chalk.hex(
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

  private getCurrentMemoryHeap() {
    const mem = process.memoryUsage();
    const used = mem.heapUsed / 1000 / 1000;
    const total = mem.heapTotal / 1000 / 1000;

    return `${used.toFixed(2)}/${total.toFixed(2)}MB`;
  }
}
