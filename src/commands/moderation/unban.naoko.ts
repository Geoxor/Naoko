import Discord from "discord.js";
import { SHAII_LOGO } from "../../constants";
import { User } from "../../naoko/Database.naoko";
import logger from "../../naoko/Logger.naoko";
import Naoko from "../../naoko/Naoko.naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "unban",
  category: "MODERATION",
  usage: "unban <user_id> <reason>",
  description: "Unbans a user",
  permissions: ["BAN_MEMBERS"],
  execute: async (message) => {
    if (message.args.length === 0) return "Please enter the ID of the user you want to unban";
    const targetUser = await Naoko.bot.users.fetch(message.args[0]);
    if (!targetUser) return "Please enter a valid user ID";
    if (targetUser.id === message.author.id) return "You can't unban yourself";

    message.args.shift(); // remove the user ID
    const reason = message.args.join(" ");

    // Create the result embed
    const embed = new Discord.MessageEmbed()
      .setTitle(`Unban - ${targetUser.tag}`)
      .setDescription(`ID: ${targetUser.id}, <@${targetUser.id}>`)
      .setThumbnail(targetUser.avatarURL() || message.author.defaultAvatarURL)
      .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
      .setTimestamp()
      .addField("Reason", reason || "No reason given", true)
      .setFooter(Naoko.version, SHAII_LOGO)
      .setColor("#00FF00");

    targetUser
      .send({ embeds: [embed] })
      .catch(() => message.reply(`I couldn't DM ${targetUser.username} the embed, probably has DMs disabled`).then(() => setTimeout(() => message.delete().catch(), 5000)));

    // Get unfucked
    await message.guild?.members.unban(targetUser.id, reason);

    // Keep track of the unban
    await User.unban(message.author.id, targetUser.id, reason).catch(() => logger.error("Unban database update failed"));

    return { embeds: [embed] };
  },
});
