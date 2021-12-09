import { User } from "../../shaii/Database.shaii";
import { defineCommand } from "../../types";
import Discord from "discord.js";
import { SHAII_LOGO } from "../../constants";
import Shaii from "../../shaii/Shaii.shaii";

export default defineCommand({
  name: "kick",
  aliases: [],
  category: "UTILITY",
  description: "Kicks a user",
  permissions: ["KICK_MEMBERS"],
  requiresProcessing: true,
  execute: async (message) => {
    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "please mention the user you wanna kick";
    if (targetUser.id === message.author.id) return "you can't kick urself";
    if (targetUser.permissions.has("ADMINISTRATOR")) return "you can't kick other admins";

    message.args.shift(); // remove the mention
    const reason = message.args.join(" ");

    // Kick him
    await targetUser.kick(reason);

    // Keep track of the kick
    await User.kick(message.author.id, targetUser.id, reason).catch(() =>
      console.log("kick database update failed")
    );

    // Create the result embed
    const embed = new Discord.MessageEmbed()
      .setTitle(`Kick - ${targetUser.user.tag}`)
      .setDescription(`ID: ${targetUser.user.id}, <@${targetUser.user.id}>`)
      .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
      .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
      .setTimestamp()
      .addField("Reason", reason || "no reason given", true)
      .setFooter(Shaii.version, SHAII_LOGO)
      .setColor("#FF4500");

    targetUser
      .send({ embeds: [embed] })
      .catch(() =>
        message.reply(`I couldn't DM ${targetUser.user.username} the embed, probably has DMs disabled`)
      );

    // Get fucked
    return { embeds: [embed] };
  },
});
