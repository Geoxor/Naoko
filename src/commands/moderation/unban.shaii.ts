import { User } from "../../shaii/Database.shaii";
import { defineCommand } from "../../types";
import Discord from "discord.js";
import { SHAII_LOGO } from "../../constants";
import Shaii from "../../shaii/Shaii.shaii";
import logger from "../../shaii/Logger.shaii";

export default defineCommand({
  name: "unban",
  aliases: [],
  category: "MODERATION",
  usage: "unban <user_id> <reason>",
  description: "Unbans a user",
  permissions: ["BAN_MEMBERS"],
  requiresProcessing: true,
  execute: async (message) => {
    if (message.args.length === 0) return "Please enter the ID of the user you want to unban";
    const targetUser = await Shaii.bot.users.fetch(message.args[0]);
    if (!targetUser) return "Please enter a valid user ID";
    if (targetUser.id === message.author.id) return "You can't unban yourself";

    message.args.shift(); // remove the user ID
    const reason = message.args.join(" ");

    // Get unfucked
    await message.guild?.members.unban(targetUser.id, reason);

    // Keep track of the unban
    await User.unban(message.author.id, targetUser.id, reason).catch(() => logger.error("Unban database update failed"));

    // Create the result embed
    const embed = new Discord.MessageEmbed()
      .setTitle(`Unban - ${targetUser.tag}`)
      .setDescription(`ID: ${targetUser.id}, <@${targetUser.id}>`)
      .setThumbnail(targetUser.avatarURL() || message.author.defaultAvatarURL)
      .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
      .setTimestamp()
      .addField("Reason", reason || "No reason given", true)
      .setFooter(Shaii.version, SHAII_LOGO)
      .setColor("#00FF00");

    targetUser
      .send({ embeds: [embed] })
      .catch(() => message.reply(`I couldn't DM ${targetUser.username} the embed, probably has DMs disabled`));

    return { embeds: [embed] };
  },
});
