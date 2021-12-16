import { User } from "../../shaii/Database.shaii";
import { defineCommand, IMessage } from "../../types";
import Discord, { MessageEmbed } from "discord.js";
import { SHAII_LOGO } from "../../constants";
import Shaii from "../../shaii/Shaii.shaii";
import logger from "../../shaii/Logger.shaii";
import { MUTED_ROLE_ID } from "../../constants";
import { durationToMilliseconds } from "../../logic/logic.shaii";

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
    if (targetUser.permissions.has("ADMINISTRATOR")) return "you can't mute other admins";
	if (targetUser.roles.cache.has(MUTED_ROLE_ID)) return "this user is already muted";

    let duration = message.args[0];
    if (duration.match(/^(\d{1,2})([sS|mM|hH|dD]$)/m) === null) return "you must specify a valid duration";
    const reason = message.args.slice(1).join(" ") || "no reason given";

    let msDuration = durationToMilliseconds(duration);
    if (msDuration === "") return `${duration} is not a valid duration`;
	if (parseInt(msDuration) > 1209600000) {
		duration = "14d", msDuration = "1209600000";
		logger.error("duration entered is too big: it has been brought to 14 days");
	}

    // Get rekt
    await targetUser.roles.add(MUTED_ROLE_ID);

    // Keep track of the mute
    await User.mute(message.author.id, targetUser.id, duration, reason).catch(() =>
      logger.error("mute database update failed")
    );

    // Send the embed
    sendMuteEmbed(message, targetUser, duration, reason);

    await setTimeout(async () => {
      try {
        await targetUser.roles.remove(MUTED_ROLE_ID);
        return sendUnmuteEmbed(message, targetUser);
      } catch (error) {
        return logger.error(error as string);
      }
    }, parseInt(msDuration));
  },
});

function sendMuteEmbed(
  message: IMessage,
  targetUser: Discord.GuildMember,
  duration: string,
  reason: string
): Promise<Discord.Message> {
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

  return message.reply({ embeds: [embed] });
}

export function sendUnmuteEmbed(
  message: IMessage,
  targetUser: Discord.GuildMember,
  reason?: string
): Promise<Discord.Message> {
  const embed = new MessageEmbed()
    .setTitle(`Unmute - ${targetUser.user.tag}`)
    .setDescription(`<@${targetUser.user.id}>, you have been unmuted.`)
    .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
    .setTimestamp()
    .addField("Reason", reason || "no reason given", true)
    .setFooter(Shaii.version, SHAII_LOGO)
    .setColor("#00FF00");

  return message.channel.send({ embeds: [embed] });
}