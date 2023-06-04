import Discord, { EmbedBuilder, Message } from "discord.js";
import { MUTED_ROLE_ID, SHAII_LOGO } from "../../constants";
import { durationToMilliseconds, msToFullTime } from "../../logic/logic";
import { User } from "../../naoko/Database";
import { logger } from "../../naoko/Logger";
import Naoko from "../../naoko/Naoko";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";

export function sendUnmuteEmbed(
  message: Message,
  targetUser: Discord.GuildMember,
  reason?: string
): Promise<Discord.Message> {
  const embed = new EmbedBuilder()
    .setTitle(`Unmute - ${targetUser.user.tag}`)
    .setDescription(`<@${targetUser.user.id}>, you have been unmuted.`)
    .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
    .setTimestamp()
    .addFields({ name: "Reason", value: reason || "No reason given", inline: true })
    .setFooter({ text: Naoko.version, iconURL: SHAII_LOGO })
    .setColor("#00FF00");

  return message.channel.send({ embeds: [embed] });
}

@command()
class Mute extends AbstractCommand {
  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get('message');
    const args = payload.get('args');

    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "Please mention the user you want to mute";
    if (targetUser.id === message.author.id) return "You can't mute yourself";
    if (targetUser.permissions.has("Administrator") || targetUser.permissions.has("ModerateMembers"))
      return "You can't mute other admins";
    if (targetUser.roles.cache.has(MUTED_ROLE_ID)) return "This user is already muted";

    let duration = args[0];
    if (!duration || !duration.match(/^(\d{1,2})([sS|mM|hH|dD]$)/m)) return "You must specify a valid duration";
    const reason = args.slice(1).join(" ") || "No reason given";

    let msDuration = durationToMilliseconds(duration);
    if (msDuration === "") return `${duration} is not a valid duration`;
    if (parseInt(msDuration) > 1209600000) {
      (duration = "14d"), (msDuration = "1209600000");
      logger.error("Duration entered is too big: it has been brought to 14 days");
    }

    await targetUser.timeout(parseInt(msDuration), reason);

    // Keep track of the mute
    await User.mute(message.author.id, targetUser.id, duration, reason);

    // Send the embed
    this.sendMuteEmbed(message, targetUser, msDuration, reason);
  }

  async sendMuteEmbed(
    message: Message,
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
        { name: "Duration", value: msToFullTime(parseInt(duration)), inline: true },
        { name: "Reason", value: reason, inline: true },
      ])
      .setFooter({ text: Naoko.version, iconURL: SHAII_LOGO })
      .setColor("#FF0000");

    try {
      await targetUser.send({ embeds: [embed] });
    } catch {
      await message.reply(`I couldn't DM ${targetUser.user.username} the embed, probably has DMs disabled`);
    }

    setTimeout(() => {
      message.delete()
        .catch((error) => logger.error(`Failed to delete message ${error}`));
    }, 5000);

    return message.reply({ embeds: [embed] });
  }

  get commandData(): CommandData {
    return {
      name: "mute",
      aliases: ["stfu", "to", "timeout", "shut"],
      category: "MODERATION",
      usage: "mute <@user> <duration> <reason>",
      description: "Mute a user",
      permissions: ["ManageRoles"],
    }
  }
}
