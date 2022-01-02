import Discord from "discord.js";
import { SHAII_LOGO } from "../../constants";
import { User } from "../../shaii/Database.shaii";
import logger from "../../shaii/Logger.shaii";
import Shaii from "../../shaii/Shaii.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "ban",
  aliases: ["yeet"],
  category: "MODERATION",
  usage: "ban <@user> <reason>",
  description: "Bans a user",
  permissions: ["BAN_MEMBERS"],
  execute: async (message) => {
    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "Please mention the user you want to ban";
    if (targetUser.id === message.author.id) return "You can't ban yourself";
    if (targetUser.permissions.has("ADMINISTRATOR")) return "You can't ban other admins";

    const reason = message.args.join(" ");

    // Create the result embed
    const embed = new Discord.MessageEmbed()
      .setTitle(`Ban - ${targetUser.user.tag}`)
      .setDescription(`ID: ${targetUser.user.id}, <@${targetUser.user.id}>`)
      .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
      .setAuthor({
        name: message.author.tag,
        iconURL: message.author.avatarURL() || message.author.defaultAvatarURL
      })
      .setTimestamp()
      .addField("Reason", reason || "No reason given", true)
      .setFooter({
        text: Shaii.version,
        iconURL: SHAII_LOGO
      })
      .setColor("#FF0000");

    targetUser
      .send({ embeds: [embed] })
      .catch(() => message.reply(`I couldn't DM ${targetUser.user.username} the embed, probably has DMs disabled`));

    // Get fucked
    await targetUser.ban({
      reason,
    });

    // Keep track of the ban
    await User.ban(message.author.id, targetUser.id, reason).catch(() => logger.error("Ban database update failed"));

    return { embeds: [embed] };
  },
});
