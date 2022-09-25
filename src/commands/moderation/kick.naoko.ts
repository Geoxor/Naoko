import Discord from "discord.js";
import { SHAII_LOGO } from "../../constants";
import { User } from "../../naoko/Database.naoko";
import logger from "../../naoko/Logger.naoko";
import Naoko from "../../naoko/Naoko.naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "kick",
  usage: "kick <@user> <reason>",
  category: "UTILITY",
  description: "Kicks a user",
  permissions: ["KICK_MEMBERS"],
  execute: async (message) => {
    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "Please mention the user you want to kick";
    if (targetUser.id === message.author.id) return "You can't kick yourself";
    if (targetUser.permissions.has("ADMINISTRATOR")) return "You can't kick other admins";

    const reason = message.args.join(" ");

    // Create the result embed
    const embed = new Discord.MessageEmbed()
      .setTitle(`Kick - ${targetUser.user.tag}`)
      .setDescription(`ID: ${targetUser.user.id}, <@${targetUser.user.id}>`)
      .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
      .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
      .setTimestamp()
      .addField("Reason", reason || "No reason given", true)
      .setFooter(Naoko.version, SHAII_LOGO)
      .setColor("#FF4500");

    targetUser
      .send({ embeds: [embed] })
      .catch(() => message.reply(`I couldn't DM ${targetUser.user.username} the embed, probably has DMs disabled`)
        .then(() => setTimeout(() => message.delete()
          .catch(), 5000)));

    // Kick him
    await targetUser.kick(reason);

    // Keep track of the kick
    await User.kick(message.author.id, targetUser.id, reason).catch(() => logger.error("Kick database update failed"));

    // Get fucked
    return { embeds: [embed] };
  },
});
