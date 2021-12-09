import { User } from "../../shaii/Database.shaii";
import { defineCommand } from "../../types";
import Discord from "discord.js";
import { SHAII_LOGO } from "../../constants";
import Shaii from "../../shaii/Shaii.shaii";

export default defineCommand({
  name: "ban",
  description: "bans a user",
  permissions: ["BAN_MEMBERS"],
  requiresProcessing: false,
  execute: async (message) => {
    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "please mention the user you wanna ban";
    if (targetUser.id === message.author.id) return "you can't ban urself";
    if (targetUser.permissions.has("ADMINISTRATOR")) return "you can't ban other admins";

    message.args.shift(); // remove the mention
    const reason = message.args.join(" ");

    // Get fucked
    await targetUser.ban({
      reason,
    });

    // Keep track of the ban
    await User.ban(message.author.id, targetUser.id, reason).catch(() =>
      console.log("ban database update failed")
    );

    // Create the result embed
    const embed = new Discord.MessageEmbed()
      .setTitle(`Ban - ${targetUser.user.tag}`)
      .setDescription(`ID: ${targetUser.user.id}, <@${targetUser.user.id}>`)
      .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
      .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
      .setTimestamp()
      .addField("Reason", reason || "no reason given", true)
      .setFooter(Shaii.version, SHAII_LOGO)
      .setColor("#FF0000");

    targetUser
      .send({ embeds: [embed] })
      .catch(() =>
        message.reply(`I couldn't DM ${targetUser.user.username} the embed, probably has DMs disabled`)
      );

    return { embeds: [embed] };
  },
});
