import Discord, { GuildMember, Message } from "discord.js";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import plugin from "../../decorators/plugin";
import { CommandExecuteResponse } from "../../types";
import { GEOXOR_GUILD_ID, MUTED_ROLE_ID, NAOKO_LOGO } from "../../constants";
import Naoko from "../../naoko/Naoko";
import { User } from "../../naoko/Database";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import Logger from "../../naoko/Logger";
import AbstractCommand, { CommandData } from "../AbstractCommand";
import TimeFormattingService from "../../service/TimeFormattingService";
import { singleton } from "tsyringe";

@singleton()
class GoodNightCommand extends AbstractCommand {
  constructor(
    private logger: Logger,
    private timeFormatter: TimeFormattingService,
  ) {
    super();
  }

  public async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get("message");
    const args = payload.get("args");

    const targetUser = message.member;
    if (!targetUser) throw new Error("No User");

    let duration = args[0];
    if (!duration) {
      duration = "6h";
    } else if (!duration.match(/^(\d{1,2})([sS|mM|hH|dD]$)/m)) {
      return "You must specify a valid duration";
    }
    const reason = args.slice(1).join(" ") || "No reason given";

    let msDuration = this.timeFormatter.durationToMilliseconds(duration);
    if (parseInt(msDuration) > 1209600000) {
      (duration = "14d"), (msDuration = "1209600000");
      this.logger.error("Duration entered is too big: it has been brought to 14 days");
    }

    // Get rekt
    await targetUser.timeout(parseInt(msDuration), reason);

    await this.selfMute(targetUser);

    // Keep track of the mute
    await User.mute(message.author.id, targetUser.id, duration, reason);

    // Send the embed
    return this.sendMuteEmbed(message, targetUser, msDuration, reason);
  }

  async sendMuteEmbed(message: Message, targetUser: Discord.GuildMember, duration: string, reason: string) {
    return new Discord.EmbedBuilder()
      .setTitle(`Mute - ${targetUser.user.tag}`)
      .setDescription(`ID: ${targetUser.user.id}, <@${targetUser.user.id}>`)
      .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
      .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() || message.author.defaultAvatarURL })
      .setTimestamp()
      .addFields([
        { name: "Explanation", value: "To be unmuted at any time, just dm the bot ~gm" },
        { name: "Duration", value: this.timeFormatter.msToFullTime(parseInt(duration)), inline: true },
        { name: "Reason", value: reason, inline: true },
      ])
      .setFooter({ text: Naoko.version, iconURL: NAOKO_LOGO })
      .setColor("#FF0000");
  }

  hasSelfMute(member: Discord.GuildMember): boolean {
    return member.roles.cache.has(GoodNight.SELF_MUTED_ROLE_ID);
  }

  selfMute(member: Discord.GuildMember): Promise<GuildMember> {
    return member.roles.add(GoodNight.SELF_MUTED_ROLE_ID);
  }

  public get commandData(): CommandData {
    return {
      name: "gn",
      aliases: ["bye", "study"],
      category: "UTILITY",
      usage: "gn <duration?> <reason?>",
      description: "Mute yourself when you go to bed or if you need to focus on studying!",
    };
  }
}

@singleton()
class GoodMorningCommand extends AbstractCommand {
  public async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get("message");

    const guild = message.client.guilds.cache.get(GEOXOR_GUILD_ID);
    const member = await guild!.members.fetch(message.author.id);
    if (message.channel.type == Discord.ChannelType.DM && this.hasSelfMute(member) && !this.hasActualMute(member)) {
      const targetUser = member;
      if (!targetUser) throw new Error("No User");

      // Unget rekt
      await targetUser.timeout(null);
      await this.unSelfMute(targetUser);

      // Keep track of the unmute
      await User.unmute(message.author.id, targetUser.id);

      // Send the embed
      await this.sendUnmuteEmbed(message, targetUser);
    }
  }

  sendUnmuteEmbed(message: Message, targetUser: Discord.GuildMember, reason?: string): Promise<Discord.Message> {
    const embed = new Discord.EmbedBuilder()
      .setTitle(`Unmute - ${targetUser.user.tag}`)
      .setDescription(`<@${targetUser.user.id}>, you have been unmuted.`)
      .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
      .setTimestamp()
      .addFields([{ name: "Reason", value: reason || "No reason given", inline: true }])
      .setFooter({ text: Naoko.version, iconURL: NAOKO_LOGO })
      .setColor("#00FF00");

    return message.channel.send({ embeds: [embed] });
  }

  hasSelfMute(member: Discord.GuildMember): boolean {
    const guild = member.client.guilds.cache.get(GEOXOR_GUILD_ID);
    const guildMember = guild?.members.cache.get(member.id);
    return guildMember!.roles.cache.has(GoodNight.SELF_MUTED_ROLE_ID);
  }

  hasActualMute(member: Discord.GuildMember): boolean {
    const guild = member.client.guilds.cache.get(GEOXOR_GUILD_ID);
    const guildMember = guild?.members.cache.get(member.id);
    return guildMember!.roles.cache.has(MUTED_ROLE_ID);
  }

  unSelfMute(member: Discord.GuildMember): Promise<GuildMember> {
    const guild = member.client.guilds.cache.get(GEOXOR_GUILD_ID);
    const guildMember = guild?.members.cache.get(member.id);
    const role = guild?.roles.cache.find((role: { id: string }) => role.id === GoodNight.SELF_MUTED_ROLE_ID);
    return guildMember!.roles.remove(role!);
  }

  public get commandData(): CommandData {
    return {
      name: "gm",
      category: "UTILITY",
      usage: "",
      description: "Unmute after using ~gn",
    };
  }
}

@plugin()
class GoodNight extends AbstractPlugin {
  public static SELF_MUTED_ROLE_ID = "967503006100750406";

  public get pluginData(): PluginData {
    return {
      name: "@shkoop/goodnight",
      version: "1.0.0",
      commands: [GoodNightCommand, GoodMorningCommand],
    };
  }
}
