import Discord from "discord.js";
import fs from "fs";
import { IRewards, IWaifu } from "../types";

/**
 * Per guild waifu fights that people initiate with a command
 * Waifus have different rarities
 * Rare waifus will reward the players defeating them
 * with more shit
 * @author Geoxor, Cimok
 */
export default class Waifu {
  public name: string;
  public attachment: Discord.MessageAttachment;
  public currentHp: number;
  public maxHp: number;
  public rewards: IRewards;
  public isDead: boolean;
  public ui: Discord.MessageEmbed;
  // public rarity: string; ?

  constructor(waifu: IWaifu) {
    this.name = waifu.name;
    this.attachment = new Discord.MessageAttachment(fs.createReadStream(waifu.image), `${this.name}.png`);
    this.currentHp = waifu.hp;
    this.maxHp = waifu.hp;
    this.rewards = waifu.rewards;
    this.isDead = false;
    this.ui = this.prepareUi();
  }

  private prepareUi() {
    const embed = new Discord.MessageEmbed();
    embed
      .setColor("#FF00B6")
      .setTitle(this.name)
      .setDescription("" + this.maxHp)
      .setImage(`attachment://${this.name}.png`);
    return embed;
  }

  public dealDamage(damage: number) {
    this.currentHp = this.currentHp - damage;
    if (this.currentHp <= 0) this.isDead = true;
  }
}
