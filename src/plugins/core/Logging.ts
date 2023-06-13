import { singleton } from "@triptyk/tsyringe";
import { ActivityType, ChannelType, EmbedBuilder, GuildMember, Message, PartialGuildMember, PartialMessage, Presence, VoiceState, codeBlock, inlineCode } from "discord.js";
import plugin from "../../decorators/plugin";
import Config from '../../naoko/Config';
import { User } from '../../naoko/Database';
import Logger from "../../naoko/Logger";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from "../AbstractCommand";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";

@singleton()
class LogsCommand extends AbstractCommand {
  constructor(
    private logger: Logger,
  ) {
    super();
  }

  execute(): CommandExecuteResponse {
    return codeBlock(this.logger.getLogHistory().substring(0, 1990));
  }

  get commandData(): CommandData {
    return {
      name: "logs",
      usage: "",
      category: "UTILITY",
      permissions: ["Administrator"],
      description: "Shows latest console logs.",
    };
  }
}

@plugin()
class Logging extends AbstractPlugin {
  constructor(
    private logger: Logger,
    private config: Config,
  ) {
    super();
  }

  public get pluginData(): PluginData {
    return {
      name: '@core/logging',
      version: "1.0.0",
      commands: [LogsCommand],
      events: {
        messageDelete: this.logMessageDelete,
        messageUpdate: this.logMessageUpdate,
        guildMemberRemove: this.logGuildMemberRemove,
        guildMemberUpdate: this.logUsernameUpdate,
        voiceStateUpdate: this.voiceStateUpdate,
        presenceUpdate: this.logPresenceUpdate,
      },
    };
  }

  private async logMessageDelete(message: Message | PartialMessage) {
    if (!message.inGuild() || message.author.bot) {
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#eb4034")
      .setTitle(`Message deleted in #${message.channel.name}`)
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
      .setDescription(`Original content\n${codeBlock(message.content)}`)
      .addFields(
        { name: `Message Author`, value: `<@${message.author.id}>` },
        {
          name: `Link`,
          value: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`,
        }
      ).setTimestamp();

    const logChannel = this.config.getChannel('GEOXOR_CHAT_LOG_CHANNEL_ID', message.client);


    await logChannel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    this.logger.print(`Message deleted in #${message.channel.name} by ${message.author?.username}`);
  }

  private async logUsernameUpdate(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) {
    if (oldMember.user.username !== newMember.user.username) {
      this.logger.print(`Updated username history for ${oldMember.id} '${newMember.user.username}'`);
      await User.pushHistory("username_history", oldMember.id, newMember.user.username);
    }

    if (oldMember.nickname !== newMember.nickname && newMember.nickname) {
      this.logger.print(`Updated nickname history for ${oldMember.id} '${newMember.nickname}'`);
      await User.pushHistory("nickname_history", oldMember.id, newMember.nickname);
    }
  }

  private async logMessageUpdate(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
    const author = oldMessage.author || newMessage.author;
    if (
      !author ||
      oldMessage.channel.type == ChannelType.DM ||
      oldMessage.content == newMessage.content ||
      author.bot
    ) {
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#fff06e")
      .setTitle(`Message edited in #${oldMessage.channel.name}`)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .addFields(
        { name: `Message Author`, value: `<@${author?.id}>` },
        { name: `From`, value: codeBlock(oldMessage.content?.substring(0, 1000) || 'N/A') },
        { name: `To`, value: codeBlock(newMessage.content?.substring(0, 1000) || 'N/A') },
        {
          name: `Link`,
          value: `https://canary.discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`,
        }
      ).setTimestamp();

    const logChannel = this.config.getChannel('GEOXOR_CHAT_LOG_CHANNEL_ID', oldMessage.client)

    await logChannel.send({ embeds: [embed] });
    this.logger.print(`Message edited at #${oldMessage.channel.name} by ${author.username}`);
  }

  private async voiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    const logChannel = this.config.getChannel('GEOXOR_VOICE_CHAT_LOG_CHANNEL_ID', oldState.client);

    const member = oldState.member || newState.member;
    if (!member || member.user.bot) return;

    if (!oldState?.channelId && newState?.channelId) {
      await logChannel.send({
        content: `User: ${member} joined <#${newState.channelId}>`,
        allowedMentions: { parse: [] }, // This will suppress all mentions
      });
      return;
    }

    if ((oldState?.channelId && newState?.channelId) && oldState?.channelId !== newState?.channelId) {
      await logChannel.send({
        content: `User: ${member} moved from <#${oldState.channelId}> => <#${newState.channelId}>`,
        allowedMentions: { parse: [] },
      });
      return;
    }

    if (oldState?.channelId && !newState?.channelId) {
      await logChannel.send({
        content: `User: ${member} left <#${oldState.channelId}>`,
        allowedMentions: { parse: [] },
      });
      return;
    }
  }

  private async logGuildMemberRemove(member: GuildMember | PartialGuildMember) {
    const channel = this.config.getChannel('GEOXOR_LEAVE_LOG_CHANNEL_ID', member.client);
    await channel.send(`User ${member.user.username} (${inlineCode(member.id)}) left the server`);
  }

  private async logPresenceUpdate(oldPresence: Presence | null, newPresence: Presence) {
    // Get their custom status
    const newStatus = newPresence.activities.find((activity) => activity.type === ActivityType.Custom)?.state;
    const oldStatus = oldPresence?.activities.find((activity) => activity.type === ActivityType.Custom)?.state;

    if (!newStatus || !newPresence.user) return;

    // This stops it from acting when the user's status updates for another reason such as
    // spotify changing tunes or not, we don't care about those events we just care
    // about their custom status
    if (newStatus === oldStatus) return;

    const user = await User.findOne({ discord_id: newPresence.user.id });
    if (!user) return;

    // Get their latest status in the database
    const lastStatus = user.status_history[user.status_history.length - 1];

    // If they have no status yet or if their latest status in the database doesn't
    // match their current status then update the database
    if (!lastStatus || lastStatus.value !== newStatus) {
      this.logger.print(`User ${newPresence.user.username} (${newPresence.user.id}) updated status to '${newStatus}'`);
      await User.pushHistory("status_history", newPresence.user.id, newStatus);
    }
  }
}
