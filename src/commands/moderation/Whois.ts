import Discord, { Client, User } from "discord.js";
import packageJson from "../../../package.json" assert { type: 'json' };
import { markdown, msToFullTime, timeSince } from "../../logic/logic";
import { User as UserDb } from "../../naoko/Database";
import { ActionHistory, CommandExecuteResponse, History, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class WhoIs extends AbstractCommand {
  async execute(message: IMessage): Promise<CommandExecuteResponse> {
    let user = message.mentions.users.first() || message.author;
    if (message.args[0] !== undefined && !message.mentions.users.first()) {
      try {
        user = await message.client.users.fetch(message.args[0]);
      } catch (e) {
        await message.reply(`I couldn't find a user with \`${message.args[0]}\``);
        return;
      }
    }

    let discriminator = '';
    // User with the '0' Discriminator have a new username
    if (user.discriminator !== '0') {
      discriminator = '#' + user.discriminator;
    }

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: `Naoko v${packageJson.version}`, iconURL: message.client.user?.displayAvatarURL() })
      .setTitle(`Who is: ${user.username}${discriminator}`)
      .setDescription(user.toString())
      .setColor("#FF00B6")
      .setThumbnail(user.avatarURL() || user.defaultAvatarURL)
      .addFields(await this.collectFields(message, user));
    await message.reply({ embeds: [embed], allowedMentions: { users: [] } });
  }

  async collectFields(message: IMessage, user: User): Promise<Discord.EmbedField[]> {
    const fields: Discord.EmbedField[] = [];
    fields.push({ name: "ID:", value: `${user.id}`, inline: false });
    fields.push({ name: "Account created:", value: user.createdAt.toUTCString(), inline: false });
    fields.push({ name: "Account age:", value: msToFullTime(Date.now() - user.createdTimestamp), inline: false });

    try {
      const member = await message.guild?.members.fetch(user);
      if (member && member.joinedTimestamp && member.joinedAt) {
        fields.push({ name: "Server joined:", value: member.joinedAt.toUTCString(), inline: false });
        fields.push({ name: "Server join age:", value: msToFullTime(Date.now() - member.joinedTimestamp), inline: false });
      }
    } catch {
      fields.push({ name: "Server joined:", value: "User is not in this server", inline: false });
    }

    const dbUser = await UserDb.findOne({ discord_id: user.id });
    if (dbUser) {
      const banHistory = this.actionHistoryToField(dbUser.ban_history, message.client);
      if (banHistory) fields.push({ name: "Ban History", value: banHistory, inline: false });

      const bonkHistory = this.actionHistoryToField(dbUser.bonk_history, message.client);
      if (bonkHistory) fields.push({ name: "Bonk History", value: bonkHistory, inline: false });

      const kickHistory = this.actionHistoryToField(dbUser.kick_history, message.client);
      if (kickHistory) fields.push({ name: "Kick History", value: kickHistory, inline: false });

      const muteHistory = this.actionHistoryToField(dbUser.mute_history, message.client);
      if (muteHistory) fields.push({ name: "Mute History", value: muteHistory, inline: false });

      const usernameHistory = this.historyToField(dbUser.username_history);
      if (usernameHistory) fields.push({ name: "Username History", value: usernameHistory, inline: false });

      const nicknameHistory = this.historyToField(dbUser.nickname_history);
      if (nicknameHistory) fields.push({ name: "Nickname History", value: nicknameHistory, inline: false });

      const statusHistory = this.historyToField(dbUser.status_history);
      if (statusHistory) fields.push({ name: "Status History", value: statusHistory, inline: false });
    }

    return fields;
  }

  actionHistoryToField(history: ActionHistory[], client: Client): string | undefined {
    if (history.length === 0) return;

    const historyString = history.reduce((acc, action) => {
      const actor = client.users.cache.get(action.casted_by)!.username || action.casted_by;
      return `${timeSince(action.timestamp)} ago - ${action.reason || "No reason given"} - by ${actor}\n${acc}`;
    }, "");

    return markdown(historyString.substring(0, 512));
  }

  historyToField(history: History[]): string | undefined {
    if (history.length === 0) return;

    const historyString = history.reduce((acc, action) => {
      return `${timeSince(action.timestamp)} ago - ${action.value.replace(/`/g, "\\`")}\n${acc}`;
    }, "");

    return markdown(historyString.substring(0, 512));
  }

  get commandData(): CommandData {
    return {
      name: "whois",
      category: "MODERATION",
      aliases: ["who"],
      usage: "whois <@user | user_id)>",
      description: "Get information about a user",
    }
  }
}
