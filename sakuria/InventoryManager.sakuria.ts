import { db } from "./Database.sakuria";
import Discord from "discord.js";

export default class InventoryManager {
  static async getInventory(user: Discord.User): Promise<Discord.MessageEmbed> {
    const inventory = await db.getInventory(user.id);
    const embed = new Discord.MessageEmbed()
      .setAuthor(user.username, "https://cdn.discordapp.com/attachments/806300597338767450/872917164091396126/unknown.png")
      .setColor("#BF360C")
      .setTitle(`${user.username}'s Inventory`)
      .setThumbnail(user.avatarURL() || user.defaultAvatarURL)
      .addField("prisms", inventory.prisms.toString(), true);
    return embed;
  }
}
