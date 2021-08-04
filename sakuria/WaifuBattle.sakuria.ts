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
  async startBattle(){                                                                                        console.log("Started Battle");

    // Create thread
    await this.initThread()

    // Update the bossbar every second if it changes
    this.bossbar = setInterval(() => this.updateBossbar(), 5000);
    

    // End the battle if its been more than the battle duration
    setTimeout(async () => {
      !this.ended && await this.endBattle();                                                                  console.log("forcefully ending battle");
    }, this.battleDuration);
  };

  /**
   * Creates the thread for the battle
   * @author Geoxor, Cimok
   */
  async initThread(){
    this.thread = await this.channel.threads.create({
      name: `${this.initialThreadName} (${this.waifu.hp}hp)`,
      autoArchiveDuration: 60
    });                                                                                                       console.log("Thread created");

    await this.thread.join();                                                                                 console.log("Thread joined");
    await this.thread.members.add(this.startUser);                                                            console.log("Thread added author");
    await this.thread.send(this.getWaifu());                                                                  console.log("Thread sent waifu");

    this.initCollector();
  }

  /**
   * Initializes the message collector
   * @author Geoxor, Cimok
   */
  async initCollector(){

    // Create the collector on the thread
    this.collector = new Discord.MessageCollector(this.thread!);                                              console.log("Collector started");

    // Collect messages
    this.collector.on('collect', async message => {
      if (message.content === '!attack') {                                                                    console.log("!attack gotten");
        this.waifu.dealDamage(100);                                                                           console.log(`damage reduced ${this.waifu.hp}`);
        // When the waifu dies finish up
        if (this.waifu.isDead) {                                                                              console.log('waifu died');
          this.ended = true;
          await this.endBattle();
          this.collector!.stop();
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
    if (this.thread!.name !== newBossbar) {                                                                   console.log('updating bossbar');
      this.thread!.setName(newBossbar);                                                                       console.log('updated bossbar');
    }
  }

  /**
   * Ends the battle
   * @author Geoxor, Cimok
   */
  async endBattle(){
    clearInterval(this.bossbar as NodeJS.Timeout);                                                            console.log('cleared bossbar timer');
    this.thread!.setName(`${this.initialThreadName} (0hp) - Victory`);                                        console.log('set to victory');
    await this.thread!.send(`Battle has ended - deleting thread in ${this.aftermathTime / 1000} seconds`);    console.log('notify deletion');
    setTimeout(() => {
      this.thread?.delete();                                                                                  console.log('deleted thread');
    }, this.aftermathTime);
  }
}