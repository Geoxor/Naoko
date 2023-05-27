import Discord, { GuildMember } from "discord.js";
import { SHAII_LOGO } from "../constants";
import { SELF_MUTED_ROLE_ID } from "../constants";
import { durationToMilliseconds, msToFullTime } from "../logic/logic";
import { User } from "../naoko/Database";
import { logger } from "../naoko/Logger";
import Naoko from "../naoko/Naoko";
import { defineCommand, IMessage } from "../types";
import { definePlugin } from "../naoko/Plugin";

const gn = defineCommand({
  name: "gn",
  aliases: ["bye", "study"],
  category: "UTILITY",
  usage: "gn <duration?> <reason?>",
  description: "Mute yourself when you go to bed or if you need to focus on studying!",
  permissions: ["ViewChannel"],
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
  const embed = new Discord.EmbedBuilder()
    .setTitle(`Mute - ${targetUser.user.tag}`)
    .setDescription(`ID: ${targetUser.user.id}, <@${targetUser.user.id}>`)
    .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
    .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() || message.author.defaultAvatarURL })
    .setTimestamp()
    .addFields([
      { name: 'Explanation', value: 'To be unmuted at any time, just dm the bot ~gm' },
      { name: 'Duration', value: msToFullTime(parseInt(duration)), inline: true },
      { name: 'Reason', value: reason, inline: true },
    ]).setFooter({ text: Naoko.version, iconURL: SHAII_LOGO })
    .setColor("#FF0000");

  return message.reply({ embeds: [embed] });
}

export function sendUnmuteEmbed(
  message: IMessage,
  targetUser: Discord.GuildMember,
  reason?: string
): Promise<Discord.Message> {
  const embed = new Discord.EmbedBuilder()
    .setTitle(`Unmute - ${targetUser.user.tag}`)
    .setDescription(`<@${targetUser.user.id}>, you have been unmuted.`)
    .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
    .setTimestamp()
    .addFields([{ name: 'Reason', value: reason || "No reason given", inline: true}])
    .setFooter({ text: Naoko.version, iconURL: SHAII_LOGO })
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
