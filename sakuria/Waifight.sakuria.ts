import Discord from "discord.js";
import fs from 'fs';
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
  public hp: number;
  public rewards: IRewards;
  // public rarity: string; ?
  public isDead: boolean;
  public ui: Discord.MessageEmbed;
  
  constructor(waifu: IWaifu){
    this.name = waifu.name;
    this.attachment = new Discord.MessageAttachment(fs.createReadStream(waifu.image), `${this.name}.png`);
    this.hp = waifu.hp;
    this.rewards = waifu.rewards;
    this.isDead = false;
    this.ui = this.prepareUi();
  }

  private prepareUi(){
    const embed = new Discord.MessageEmbed();
    embed
      .setColor("#FF00B6")
      .setTitle(this.name)
      .setDescription('' + this.hp)
      .setImage(`attachment://${this.name}.png`);
    return embed;
  }

  public dealDamage(damage: number){
    this.hp = this.hp - damage; 
    if (this.hp <= 0) this.isDead = true;
  }
}
