import Discord, { GuildMember, MessageEmbed } from "discord.js";
import { KATSUMI_LOGO } from "../constants";
import { SELF_MUTED_ROLE_ID } from "../constants";
import { durationToMilliseconds, msToFullTime } from "../logic/logic.shaii";
import { User } from "../shaii/Database.shaii";
import logger from "../shaii/Logger.shaii";
import Shaii from "../shaii/Shaii.shaii";
import { defineCommand, IMessage } from "../types";
import { definePlugin } from "../shaii/Plugin.shaii";

const gn = defineCommand({
  name: "gn",
  aliases: ["bye", "study"],
  category: "UTILITY",
  usage: "gn <duration?> <reason?>",
  description: "Mute yourself when you go to bed or if you need to focus on studying!",
  permissions: ["VIEW_CHANNEL"],
  execute: async (message) => {
    const targetUser = message.member;
    if (!targetUser) throw new Error("No User");

    let duration = message.args[0];
    if (!duration) {
        duration = "6h";
    } else if (!duration.match(/^(\d{1,2})([sS|mM|hH|dD]$)/m)) {
        return "You must specify a valid duration";
    }
    const reason = message.args.slice(1).join(" ") || "No reason given";

    let msDuration = durationToMilliseconds(duration);
    if (parseInt(msDuration) > 1209600000) {
      (duration = "14d"), (msDuration = "1209600000");
      logger.error("Duration entered is too big: it has been brought to 14 days");
    }

    // Get rekt
    await targetUser.timeout(parseInt(msDuration), reason);

    selfMute(targetUser);

    // Keep track of the mute
    await User.mute(message.author.id, targetUser.id, duration, reason).catch(() =>
      logger.error("Mute database update failed")
    );

    // Send the embed
    sendMuteEmbed(message, targetUser, msDuration, reason);
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
    .addField("Explanation", `To be unmuted at any time, just dm the bot ~gm`)
    .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
    .setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL)
    .setTimestamp()
    .addField("Duration", msToFullTime(parseInt(duration)), true)
    .addField("Reason", reason, true)
    .setFooter(Shaii.version, KATSUMI_LOGO)
    .setColor("#FF0000");

//   targetUser
//     .send({ embeds: [embed] })
//     .catch(() => message.reply(`I couldn't DM ${targetUser.user.username} the embed, probably has DMs disabled`));

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
    .addField("Reason", reason || "No reason given", true)
    .setFooter(Shaii.version, KATSUMI_LOGO)
    .setColor("#00FF00");

  return message.channel.send({ embeds: [embed] });
}

export function hasSelfMute(member: Discord.GuildMember): boolean {
  return member.roles.cache.has(SELF_MUTED_ROLE_ID);
}

export async function selfMute(member: Discord.GuildMember): Promise<GuildMember> {
  return member.roles.add(SELF_MUTED_ROLE_ID);
}

export default definePlugin({
    name: "@shkoop/goodnight",
    version: "1.0.0",
    command: [gn],
  });