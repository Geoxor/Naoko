import { User } from "../../shaii/Database.shaii";
import { defineCommand } from "../../types";
import Discord, { MessageEmbed } from "discord.js";
import { SHAII_LOGO } from "../../constants";
import Shaii from "../../shaii/Shaii.shaii";
import logger from "../../shaii/Logger.shaii";
import { MUTED_ROLE_ID } from "../../constants";
import { durationToMilliseconds } from "../../logic/logic.shaii";
import { MembershipStates } from "discord.js/typings/enums";

export default defineCommand({
  name: "mute",
  aliases: [],
  category: "MODERATION",
  usage: "mute <@user> <duration> <reason>",
  description: "mute an user",
  permissions: ["MANAGE_ROLES"],
  requiresProcessing: true,
  execute: async (message) => {
    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "please mention the user you wanna mute";
    if (targetUser.id === message.author.id) return "you can't mute urself";
    if (targetUser.permissions.has("ADMINISTRATOR")) return "you can't ban other admins";

    message.args = message.args // remove the mention in an ugly, sorry
      .join(" ")
      .replace("@", "")
      .replace(message.mentions.members?.first()?.displayName || "", "")
      .split(" ")
	  .slice(1); 
    logger.print(message.args.join(", "));
    const duration = message.args[0];
    if (duration.match(/^(\d{1,3})([sS|mM|hH|dD|wW|tT|yY]$)/m) === null) return "you must specify a duration";
    const reason = message.args.slice(1).join(" ") || "no reason given";

    const msDuration = durationToMilliseconds(duration);
    if (msDuration === "") return `${duration} is not a valid duration`;

    // Get rekt
    await targetUser.roles.add(MUTED_ROLE_ID);

    // Keep track of the mute
    await User.mute(message.author.id, targetUser.id, duration, reason).catch(() =>
      logger.error("mute database update failed")
    );

    // Create the result embed
    const embed = new Discord.MessageEmbed()
      .setTitle(`Mute - ${targetUser.user.tag}`)
      .setDescription(`ID: ${targetUser.user.id}, <@${targetUser.user.id}>`)
      .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
      .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
      .setTimestamp()
      .addField("Duration", duration, true)
      .addField("Reason", reason, true)
      .setFooter(Shaii.version, SHAII_LOGO)
      .setColor("#FF0000");

    targetUser
      .send({ embeds: [embed] })
      .catch(() => message.reply(`I couldn't DM ${targetUser.user.username} the embed, probably has DMs disabled`));

    message.reply({ embeds: [embed] });

    await setTimeout(async () => {
      try {
        await targetUser.roles.remove(MUTED_ROLE_ID);

        const embed = new MessageEmbed()
          .setTitle(`Unmute - ${targetUser.user.tag}`)
          .setDescription(`<@${targetUser.user.id}>, you have been unmuted.`)
          .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
          .setTimestamp()
          .setFooter(Shaii.version, SHAII_LOGO)
          .setColor("#00FF00");

        return message.channel.send({ embeds: [embed] });
      } catch (error) {
        return logger.error(error as string);
      }
    }, parseInt(msDuration));
  },
});
