// import { User } from "./Database.shaii";
// import Discord from "discord.js";

// export default class InventoryManager {
//   static async getInventory(user: Discord.User): Promise<Discord.MessageEmbed> {
//     const inventory = await db.getInventory(user.id);
//     const embed = new Discord.MessageEmbed()
//       .setAuthor(
//         user.username,
//         "https://cdn.discordapp.com/attachments/806300597338767450/872917164091396126/unknown.png"
//       )
//       .setColor("#BF360C")
//       .setTitle(`${user.username}'s Inventory`)
//       .setThumbnail(user.avatarURL() || user.defaultAvatarURL)
//       .addField("prisms", inventory.prisms.toString(), true);
//     return embed;
//   }

//   static async getStatistics(user: Discord.User): Promise<Discord.MessageEmbed> {
//     const statistics = await db.getStatistics(user.id);
//     const embed = new Discord.MessageEmbed()
//       .setAuthor(
//         user.username,
//         "https://cdn.discordapp.com/attachments/806300597338767450/872917164091396126/unknown.png"
//       )
//       .setColor("#BF360C")
//       .setTitle(`${user.username}'s Statistics`)
//       .setThumbnail(user.avatarURL() || user.defaultAvatarURL);

//     let statKeys = `
//       \`Experience\`

//       \`Total Attacks\`
//       \`Total Dmg Dealt\`
//       \`Total Prisms Collected\`
//       \`Total Prisms Spent\`

//       \`Common Waifus Killed\`
//       \`Uncommon Waifus Killed\`
//       \`Rare Waifus Killed\`
//       \`Legendary Waifus Killed\`
//       \`Mythical Waifus Killed\`
//     `;

//     let statValues = `
//       \`${statistics.xp}\`

//       \`${statistics.totalAttacks}\`
//       \`${statistics.totalDamageDealt}\`
//       \`${statistics.totalPrismsCollected}\`
//       \`${statistics.totalPrismsSpent}\`

//       \`${statistics.commonWaifusKilled}\`
//       \`${statistics.uncommonWaifusKilled}\`
//       \`${statistics.rareWaifusKilled}\`
//       \`${statistics.legendaryWaifusKilled}\`
//       \`${statistics.mythicalWaifusKilled}\`
//     `;

//     embed.addField("Stat", statKeys, true);
//     embed.addField("Value", statValues, true);
//     return embed;
//   }
// }
