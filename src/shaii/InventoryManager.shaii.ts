import Discord from "discord.js";
import { INVENTORY_ICON } from "../constants";
import { markdown } from "../logic/logic.shaii";
import { User } from "./Database.shaii";

export default class InventoryManager {
  static async getInventory(user: Discord.User): Promise<Discord.MessageEmbed> {
    const dbUser = await User.findOne({ discord_id: user.id })!;
    const { statistics } = dbUser!;

    let fields = [`💎 Prisms: ${statistics.balance} pr`];

    const embed = new Discord.MessageEmbed()
      .setAuthor(`${user.username}'s Inventory`, user.avatarURL() || user.defaultAvatarURL)
      .setColor("#BF360C")
      .setThumbnail(INVENTORY_ICON)
      .addField("\u200B", markdown(fields.map((field) => field + "\n").join("")), true);
    return embed;
  }

  static async getStatistics(user: Discord.User): Promise<Discord.MessageEmbed> {
    const dbUser = await User.findOne({ discord_id: user.id })!;
    const { statistics } = dbUser!;

    const embed = new Discord.MessageEmbed()
      .setAuthor(`${user.username}'s Statistics`, user.avatarURL() || user.defaultAvatarURL)
      .setColor("#BF360C")
      .setThumbnail(INVENTORY_ICON)
      .setTitle(`${user.username}'s Statistics`)
      .setThumbnail(user.avatarURL() || user.defaultAvatarURL);

    let statKeys = `
      \`Experience\`

      \`Total Attacks\`
      \`Total Dmg Dealt\`
      \`Total Prisms Collected\`
      \`Total Prisms Spent\`

      \`Common Waifus Killed\`
      \`Uncommon Waifus Killed\`
      \`Rare Waifus Killed\`
      \`Legendary Waifus Killed\`
      \`Mythical Waifus Killed\`
    `;

    let statValues = `
      \`${statistics.xp}\`

      \`${statistics.total_attacks}\`
      \`${statistics.total_damage_dealt}\`
      \`${statistics.total_prisms_collected}\`
      \`${statistics.total_prisms_spent}\`

      \`${statistics.waifu_types_killed.common}\`
      \`${statistics.waifu_types_killed.uncommon}\`
      \`${statistics.waifu_types_killed.rare}\`
      \`${statistics.waifu_types_killed.legendary}\`
      \`${statistics.waifu_types_killed.mythical}\`
    `;

    embed.addField("Value", statValues || "", true);
    embed.addField("Stat", statKeys || "", true);
    return embed;
  }
}
