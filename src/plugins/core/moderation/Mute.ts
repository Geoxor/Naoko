import Discord, { EmbedBuilder, Message } from 'discord.js';
import { NAOKO_LOGO, MUTED_ROLE_ID } from '../../../constants';
import Naoko from '../../../naoko/Naoko';
import MessageCreatePayload from '../../../pipeline/messageCreate/MessageCreatePayload';
import { CommandExecuteResponse } from '../../../types';
import { User } from '../../../naoko/Database';
import AbstractCommand, { CommandData } from '../../AbstractCommand';
import TimeFormattingService from '../../../service/TimeFormattingService';
import Logger from '../../../naoko/Logger';
import { singleton } from '@triptyk/tsyringe';

@singleton()
export class Mute extends AbstractCommand {
  constructor(
    private timeFormatter: TimeFormattingService,
    private logger: Logger,
  ) {
    super();
  }

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
    if (!duration || !duration.match(/^(\d{1,2})([sS|mM|hH|dD]$)/m)) return "You must specify a valid duration, e.g. 1H, 30m or 3d";
    const reason = args.slice(1).join(" ") || "No reason given";

    let msDuration = this.timeFormatter.durationToMilliseconds(duration);
    if (msDuration === "") return `${duration} is not a valid duration`;
    if (parseInt(msDuration) > 1209600000) {
      (duration = "14d"), (msDuration = "1209600000");
      this.logger.error("Duration entered is too big: it has been brought to 14 days");
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
      .setTitle(`Mute - ${targetUser.user.username}`)
      .setDescription(`ID: ${targetUser.user.id}, <@${targetUser.user.id}>`)
      .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
      .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() || message.author.defaultAvatarURL })
      .setTimestamp()
      .addFields([
        { name: "Duration", value: this.timeFormatter.msToFullTime(parseInt(duration)), inline: true },
        { name: "Reason", value: reason, inline: true },
      ])
      .setFooter({ text: Naoko.version, iconURL: NAOKO_LOGO })
      .setColor("#FF0000");

    try {
      await targetUser.send({ embeds: [embed] });
    } catch {
      await message.reply(`I couldn't DM ${targetUser.user.username} the embed, probably has DMs disabled`);
    }

    setTimeout(() => {
      message.delete()
        .catch((error) => this.logger.error(`Failed to delete message ${error}`));
    }, 5000);

    return message.reply({ embeds: [embed] });
  }

  get commandData(): CommandData {
    return {
      name: "mute",
      aliases: ["stfu", "timeout", "shut"],
      category: "MODERATION",
      usage: "<@user> <duration> [<reason>]",
      description: "Mute an user",
      permissions: ["ManageRoles"],
    }
  }
}

@singleton()
export class Unmute extends AbstractCommand {
  constructor(
    private logger: Logger,
  ) {
    super();
  }

  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get('message');

    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "Please mention the user you want to unmute";
    if (targetUser.id === message.author.id) return "You can't unmute yourself";

    const reason = payload.get('args').join(" ");

    // Unget rekt
    await targetUser.roles.remove(MUTED_ROLE_ID);
    await targetUser.timeout(0 && Date.now(), reason);

    // Keep track of the unmute
    await User.unmute(message.author.id, targetUser.id, reason).catch(() => this.logger.error("Unmute database update failed"));

    // Send the embed
    await this.sendUnmuteEmbed(message, targetUser, reason);
  }

  sendUnmuteEmbed(
    message: Message,
    targetUser: Discord.GuildMember,
    reason?: string
  ): Promise<Discord.Message> {
    const embed = new EmbedBuilder()
      .setTitle(`Unmute - ${targetUser.user.username}`)
      .setDescription(`<@${targetUser.user.id}>, you have been unmuted.`)
      .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
      .setTimestamp()
      .addFields({ name: "Reason", value: reason || "No reason given", inline: true })
      .setFooter({ text: Naoko.version, iconURL: NAOKO_LOGO })
      .setColor("#00FF00");

    return message.channel.send({ embeds: [embed] });
  }

  get commandData(): CommandData {
    return {
      name: "unmute",
      category: "MODERATION",
      usage: "<@user> [<reason>]",
      description: "Unmute an user",
      permissions: ["ManageRoles"],
    }
  }
}
