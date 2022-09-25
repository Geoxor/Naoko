import Discord, { Client, User } from "discord.js";
import { version } from "../../../package.json";
import { markdown, msToFullTime, timeSince } from "../../logic/logic";
import { User as UserDb } from "../../naoko/Database";
import { ActionHistory, defineCommand, History, IMessage } from "../../types";

export default defineCommand({
  name: "whois",
  category: "MODERATION",
  aliases: ["who"],
  usage: "whois <@user | user_id)>",
  description: "Get information about a user",
  execute: async (message) => {
    let user = message.mentions.users.first() || message.author;
    if (message.args[0] !== undefined && !message.mentions.users.first()) {
      try {
        user = await message.client.users.fetch(message.args[0]);
      } catch (e) {
        await message.reply(`I couldn't find a user with \`${message.args[0]}\``);
        return;
      }
    }

    const embed = new Discord.MessageEmbed()
      .setAuthor(`Naoko v${version}`, message.client.user?.displayAvatarURL())
      .setTitle(`Who is: ${user.username}#${user.discriminator}`)
      .setDescription(user.toString())
      .setColor("#FF00B6")
      .setThumbnail(user.avatarURL() || user.defaultAvatarURL)
      .addFields(await collectFields(message, user));
    await message.reply({ embeds: [embed], allowedMentions: { users: [] } });
  },
});

async function collectFields(message: IMessage, user: User): Promise<Discord.EmbedFieldData[]> {
  const fields: Discord.EmbedFieldData[] = [];
  fields.push({ name: "ID:", value: `${user.id}` });
  fields.push({ name: "Account created:", value: user.createdAt.toUTCString() });
  fields.push({ name: "Account age:", value: msToFullTime(Date.now() - user.createdTimestamp) });

  try {
    const member = await message.guild?.members.fetch(user);
    if (member && member.joinedTimestamp && member.joinedAt) {
      fields.push({ name: "Server joined:", value: member.joinedAt.toUTCString() });
      fields.push({ name: "Server join age:", value: msToFullTime(Date.now() - member.joinedTimestamp) });
    }
  } catch {
    fields.push({ name: "Server joined:", value: "User is not in this server" });
  }

  const dbUser = await UserDb.findOne({ discord_id: user.id });
  if (dbUser) {
    const banHistory = actionHistoryToField(dbUser.ban_history, message.client);
    if (banHistory) fields.push({ name: "Ban History", value: banHistory });

    const bonkHistory = actionHistoryToField(dbUser.bonk_history, message.client);
    if (bonkHistory) fields.push({ name: "Bonk History", value: bonkHistory });

    const kickHistory = actionHistoryToField(dbUser.kick_history, message.client);
    if (kickHistory) fields.push({ name: "Kick History", value: kickHistory });

    const muteHistory = actionHistoryToField(dbUser.mute_history, message.client);
    if (muteHistory) fields.push({ name: "Mute History", value: muteHistory });

    const usernameHistory = historyToField(dbUser.username_history);
    if (usernameHistory) fields.push({ name: "Username History", value: usernameHistory });

    const nicknameHistory = historyToField(dbUser.nickname_history);
    if (nicknameHistory) fields.push({ name: "Nickname History", value: nicknameHistory });

    const statusHistory = historyToField(dbUser.status_history);
    if (statusHistory) fields.push({ name: "Status History", value: statusHistory });
  }

  return fields;
}

function actionHistoryToField(history: ActionHistory[], client: Client): string | undefined {
  if (history.length === 0) return;

  const historyString = history.reduce((acc, action) => {
    const actor = client.users.cache.get(action.casted_by)!.username || action.casted_by;
    return `${timeSince(action.timestamp)} ago - ${action.reason || "No reason given"} - by ${actor}\n${acc}`;
  }, "");

  return markdown(historyString.substring(0, 512));
}

function historyToField(history: History[]): string | undefined {
  if (history.length === 0) return;

  const historyString = history.reduce((acc, action) => {
    return `${timeSince(action.timestamp)} ago - ${action.value.replace(/`/g, "\\`")}\n${acc}`;
  }, "");

  return markdown(historyString.substring(0, 512));
}
