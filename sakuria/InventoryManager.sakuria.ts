import { db } from "./Database.sakuria";
import Discord from "discord.js";

export default class InventoryManager {
  static async getInventory(user: Discord.User): Promise<Discord.MessageEmbed> {
    const inventory = await db.getInventory(user.id);
    const embed = new Discord.MessageEmbed()
      .setAuthor(user.username, user.avatarURL() || user.defaultAvatarURL) 
      .setColor("#BF360C") 
      .setTitle(`${user.username}'s Inventory`)
      .setThumbnail('https://cdn.discordapp.com/attachments/806300597338767450/872917164091396126/unknown.png')
      .addField("Balance", inventory.balance.toString(), true)
    return embed;
  }
}