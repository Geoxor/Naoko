import Waifu from "./Waifu.sakuria";
import Discord from "discord.js";
import waifus from "../assets/waifus.json";
import { IWaifu } from "../types";

/**
 * This manages a waifu battle, randomly picking enemy waifus,
 * creating threads and deleting them and
 * rewarding players and keeping track of them
 * @author Cimok, Geoxor, azur1s
 */
export default class WaifuBattle {
  public chosenWaifu: IWaifu;
  public waifu: Waifu
  public participants: Discord.User[];
  public startUser: Discord.User;
  public channel: Discord.TextChannel;
  public thread: Discord.ThreadChannel | null;
  public collector: Discord.MessageCollector | null;
  public bossbar: NodeJS.Timer | null;
  public battleDuration: number;
  public aftermathTime: number;
  public initialThreadName: string;
  public ended: boolean;

  constructor(startUser: Discord.User, channel: Discord.TextChannel){
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
    this.initialThreadName = `waifu battle!`;
    this.ended = false;
  }

  /**
   * Returns the waifu embed
   * @returns {Discord.MessageOptions} of the waifu
   * @author Geoxor, Cimok
   */
  getWaifu(): Discord.MessageOptions {
    return {files: [this.waifu.attachment], embeds: [this.waifu.ui]};
  };

  /**
   * Starts the battle
   * @author Geoxor, Cimok
   */
  async startBattle(){

    // Create thread
    await this.initThread()

    // Update the bossbar every second if it changes
    this.bossbar = setInterval(() => this.updateBossbar(), 1000);

    // End the battle if its been more than the battle duration
    setTimeout(async () => this.ended && await this.endBattle(), this.battleDuration);
  };

  /**
   * Creates the thread for the battle
   * @author Geoxor, Cimok
   */
  async initThread(){
    this.thread = await this.channel.threads.create({
      name: `${this.initialThreadName} (${this.waifu.hp}hp)`,
      autoArchiveDuration: 60
    });

    await this.thread.join();
    await this.thread.members.add(this.startUser);
    await this.thread.send(this.getWaifu());

    this.initCollector();
  }

  /**
   * Initializes the message collector
   * @author Geoxor, Cimok
   */
  async initCollector(){

    // Create the collector on the thread
    this.collector = new Discord.MessageCollector(this.thread!);

    // Collect messages
    this.collector.on('collect', message => {
      if (message.content === '!attack') {
        this.waifu.dealDamage(100);

        // When the waifu dies finish up
        if (this.waifu.isDead) {
          this.collector!.stop();
          this.ended = true;
          this.endBattle();
        }
      }
    });
  }

  /**
   * Updates the bossbar with the current battle stats
   * @author Geoxor, Cimok
   */
  async updateBossbar(){
    const newBossbar = `${this.initialThreadName} (${this.waifu.hp}hp)`;
    if (this.thread!.name !== newBossbar) await this.thread!.setName(newBossbar); 
  }

  /**
   * Ends the battle
   * @author Geoxor, Cimok
   */
  async endBattle(){
    await this.thread?.send(`Battle has ended - deleting thread in ${this.aftermathTime / 1000} seconds`);
    clearInterval(this.bossbar as NodeJS.Timeout);
    setTimeout(() => this.thread?.delete(), this.aftermathTime);
  }
}