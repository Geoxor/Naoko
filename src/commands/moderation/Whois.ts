import Discord, { Client, Message, User, codeBlock } from "discord.js";
import packageJson from "../../../package.json" assert { type: 'json' };
import command from '../../decorators/command';
import { msToFullTime, timeSince } from "../../logic/logic";
import { User as UserDb } from "../../naoko/Database";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import { ActionHistory, CommandExecuteResponse, History } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';

@command()
class WhoIs extends AbstractCommand {
  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get('message');
    const args = payload.get('args');

    let user = message.mentions.users.first() || message.author;
    if (args[0] !== undefined && !message.mentions.users.first()) {
      try {
        user = await message.client.users.fetch(args[0]);
      } catch (e) {
        await message.reply(`I couldn't find a user with \`${args[0]}\``);
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

  async collectFields(message: Message, user: User): Promise<Discord.EmbedField[]> {
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

    let historyString = '';
    for (const action of history) {
      const actor = client.users.cache.get(action.casted_by)!.username || action.casted_by;
      const newHistoryString = `${timeSince(action.timestamp)} ago - ${action.reason || "No reason given"} - by ${actor}`;
      if ((newHistoryString + historyString).length > 500) {
        break;
      }

      historyString += "\n" + newHistoryString;
    }

    return codeBlock(historyString);
  }

  historyToField(history: History[]): string | undefined {
    if (history.length === 0) return;

    let historyString = '';
    for (const action of history) {
      const newHistoryString = `${timeSince(action.timestamp)} ago - ${action.value.replace(/`/g, "\\`")}`;
      if ((newHistoryString + historyString).length > 500) {
        break;
      }

      historyString += "\n" + newHistoryString;
    }

    return codeBlock(historyString);
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
