import { User } from "./Database.shaii";
import Discord from "discord.js";

export default class InventoryManager {
  static async getInventory(user: Discord.User): Promise<Discord.MessageEmbed> {
    const dbUser = await User.findOne({ discord_id: user.id })!;
    const { statistics } = dbUser!;
    console.log(dbUser);

    const embed = new Discord.MessageEmbed()
      .setAuthor(
        user.username,
        "https://cdn.discordapp.com/attachments/806300597338767450/872917164091396126/unknown.png"
      )
      .setColor("#BF360C")
      .setTitle(`${user.username}'s Inventory`)
      .setThumbnail(user.avatarURL() || user.defaultAvatarURL)
      .addField("prisms", statistics.balance.toString(), true);
    return embed;
  }

  static async getStatistics(user: Discord.User): Promise<Discord.MessageEmbed> {
    const dbUser = await User.findOne({ discord_id: user.id })!;
    const { statistics } = dbUser!;

    const embed = new Discord.MessageEmbed()
      .setAuthor(
        user.username,
        "https://cdn.discordapp.com/attachments/806300597338767450/872917164091396126/unknown.png"
      )
      .setColor("#BF360C")
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

    embed.addField("Stat", statKeys || "", true);
    embed.addField("Value", statValues || "", true);
    return embed;
  }
}
