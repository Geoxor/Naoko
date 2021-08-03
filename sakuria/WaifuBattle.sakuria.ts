import Waifu from "../sakuria/Waifight.sakuria";
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
  public participants: Discord.GuildMember[];
  public channel: Discord.TextChannel;
  public thread: Discord.ThreadChannel | null;
  public bossbar: NodeJS.Timer | null;
  public battleDuration: number;
  public aftermathTime: number;

  constructor(channel: Discord.TextChannel){
    this.chosenWaifu = waifus[~~(Math.random() * waifus.length - 1)];
    this.waifu = new Waifu(this.chosenWaifu);
    this.participants = [];
    this.channel = channel;
    this.bossbar = null;
    this.thread = null;
    this.battleDuration = 60000;
    this.aftermathTime = 20000;
  }

  /**
   * Returns the waifu embed
   * @returns {Discord.MessageEmbed} of the waifu
   * @author Geoxor, Cimok
   */
  getWaifu(){
    return {files: [this.waifu.attachment], embeds: [this.waifu.ui]};
  };

  /**
   * Starts the battle
   * @author Geoxor, Cimok
   */
  async startBattle(){
    const initialThreadName = `waifu battle!`;
    this.thread = await this.channel.threads.create({
      name: initialThreadName,
      autoArchiveDuration: 60
    });

    await this.thread.join();
    await this.thread.send(this.getWaifu());

    this.bossbar = setInterval(() => this.thread?.setName(`${initialThreadName} (${this.waifu.hp}hp)`), 5000);

    setTimeout(async () => await this.endBattle(), this.battleDuration);
  };

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