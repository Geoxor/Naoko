import Waifu from "./Waifu.sakuria";
import Discord from "discord.js";
import waifus from "../assets/waifus.json";
import { IWaifu } from "../types";
import logger from "./Logger.sakuria";

/**
 * This manages a waifu battle, randomly picking enemy waifus,
 * creating threads and deleting them and
 * rewarding players and keeping track of them
 * @author Cimok, Geoxor, azur1s
 */
export default class WaifuBattle {
  private lastBossbarMessage: Discord.Message | null;
  public chosenWaifu: IWaifu;
  public waifu: Waifu;
  public participants: Discord.User[];
  public startUser: Discord.User;
  public channel: Discord.TextChannel;
  public thread: Discord.ThreadChannel | null;
  public collector: Discord.MessageCollector | null;
  public bossbar: NodeJS.Timer | null;
  public battleDuration: number;
  public aftermathTime: number;
  public threadName: string;
  public ended: boolean;

  constructor(startUser: Discord.User, channel: Discord.TextChannel) {
    this.chosenWaifu = waifus[~~(Math.random() * waifus.length - 1)];
    this.waifu = new Waifu(this.chosenWaifu);
    this.participants = [];
    this.startUser = startUser;
    this.channel = channel;
    this.bossbar = null;
    this.thread = null;
    this.collector = null;
    this.battleDuration = 60000;
    this.aftermathTime = 20000;
    this.threadName = `waifu battle!`;
    this.ended = false;
    this.lastBossbarMessage = null;
  }

  /**
   * Returns the waifu embed
   * @returns {Discord.MessageOptions} of the waifu
   * @author Geoxor, Cimok
   */
  getWaifu(): Discord.MessageOptions {
    return { content: "type !attack to kill her!", files: [this.waifu.attachment], embeds: [this.waifu.ui] };
  }

  /**
   * Starts the battle
   * @author Geoxor, Cimok
   */
  async startBattle() {
    logger.sakuria.generic("[WaifuBattle] Started Battle");

    // Create thread
    await this.initThread();

    // Update the bossbar every second if it changes
    this.bossbar = setInterval(() => this.updateBossbar(), 5000);

    // End the battle if its been more than the battle duration
    setTimeout(async () => {
      !this.ended && (await this.endBattle());
      logger.sakuria.generic("[WaifuBattle] forcefully ending battle");
    }, this.battleDuration);
  }

  /**
   * Creates the thread for the battle
   * @author Geoxor, Cimok
   */
  async initThread() {
    this.thread = await this.channel.threads.create({
      name: this.threadName,
      autoArchiveDuration: 60,
    });
    logger.sakuria.generic("[WaifuBattle] Thread created");

    await this.thread.join();
    logger.sakuria.generic("[WaifuBattle] Thread joined");
    await this.thread.members.add(this.startUser);
    logger.sakuria.generic("[WaifuBattle] Thread added author");
    await this.thread.send(this.getWaifu());
    logger.sakuria.generic("[WaifuBattle] Thread sent waifu");

    this.initCollector();
  }

  /**
   * Initializes the message collector
   * @author Geoxor, Cimok
   */
  async initCollector() {
    // Create the collector on the thread
    this.collector = new Discord.MessageCollector(this.thread!);
    logger.sakuria.generic("[WaifuBattle] Collector started");

    // Collect messages
    this.collector.on("collect", async (message) => {
      if (message.content === "!attack") {
        this.waifu.dealDamage(100);
        logger.sakuria.generic(`damage reduced ${this.waifu.hp}`);
        if (this.waifu.isDead) await this.endBattle();
      }
    });
  }

  /**
   * Updates the bossbar with the current battle stats
   * @author Geoxor, Cimok
   */
  async updateBossbar() {
    const newBossbar = `${this.waifu.name} still has *${this.waifu.hp}* HP!`;
    if (!this.ended && this.lastBossbarMessage?.content !== newBossbar) {
      this.lastBossbarMessage = await this.thread!.send(newBossbar);
    }
  }

  /**
   * Ends the battle
   * @author Geoxor, Cimok
   */
  async endBattle() {
    if (this.ended) return;
    this.ended = true;
    this.collector!.stop();
    clearInterval(this.bossbar as NodeJS.Timeout);
    logger.sakuria.generic("cleared bossbar timer");
    await this.thread!.setName(`${this.threadName} victory`);
    logger.sakuria.generic("set to victory");
    await this.thread!.send(`Battle has ended - deleting thread in ${this.aftermathTime / 1000} seconds`);
    logger.sakuria.generic("notify deletion");
    setTimeout(() => {
      this.thread?.delete();
      logger.sakuria.generic("deleted thread");
    }, this.aftermathTime);
  }
}
