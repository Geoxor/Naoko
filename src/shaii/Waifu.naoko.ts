import Discord from "discord.js";
import fs from "fs";
import { SHAII_LOGO } from "../constants";
import { calcDefense } from "../logic/logic.naoko";
import { IRewards, IWaifu, IWaifuRarity, IWaifuRarityEmoji, IWaifuRarityName } from "../types";

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
  public attacksDealt: number = 0;
  public armor: number;
  public rewards: IRewards;
  public isDead: boolean;
  public rarity: IWaifuRarityName;
  public emoji: IWaifuRarityEmoji;
  public ui: Discord.MessageEmbed;
  public color: Discord.HexColorString;
  private imageFile: string;

  constructor(waifu: IWaifu, rarity: IWaifuRarity) {
    this.name = waifu.name;
    this.imageFile = waifu.image;
    this.currentHp = rarity.hp;
    this.maxHp = rarity.hp;
    this.armor = rarity.armor || 0;
    this.rarity = rarity.name;
    this.emoji = rarity.emoji;
    this.color = rarity.color;
    this.rewards = rarity.rewards;
    this.isDead = false;
    this.attachment = new Discord.MessageAttachment(
      fs.createReadStream(`./src/assets/waifus/${this.rarity}/${this.imageFile}`),
      "waifu.png"
    );
    this.ui = this.prepareUi();
  }

  public getHpBar() {
    return new Discord.MessageEmbed()
      .setColor(this.color)
      .setTitle(`⚠️ ${this.name} still has *${~~this.currentHp}* HP!`)
      .addField("Current HP: ", this.currentHp.toFixed(2), true)
      .addField("Total Attacks Dealt: ", this.attacksDealt.toString(), true)
      .setAuthor(this.name, SHAII_LOGO);
  }

  private prepareUi() {
    return new Discord.MessageEmbed()
      .setColor(this.color)
      .setTitle(this.name)
      .addField("Rarity", `${this.emoji} ${this.rarity}`, true)
      .setDescription(`${this.maxHp} HP ${this.armor} AP`)
      .setImage(`attachment://waifu.png`)
      .setAuthor(this.name, SHAII_LOGO);
  }

  public dealDamage(damage: number) {
    this.attacksDealt++;
    if (this.armor)
      // Check if the armor is defined or not
      this.currentHp = this.currentHp - damage * calcDefense(this.armor);
    else this.currentHp = this.currentHp - damage;
    if (this.currentHp <= 0) this.isDead = true;
  }
}
