import Discord, { Client, User } from "discord.js";
import { version } from "../../../package.json";
import { msToFullTime } from "../../logic/logic.shaii";
import { defineCommand, IMessage, Kick } from "../../types";
import { User as UserDb } from "../../shaii/Database.shaii";

export default defineCommand({
  name: "whois",
  description: "Get information about a user",
  requiresProcessing: false,
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
      .setAuthor(`Shaii v${version}`, message.client.user?.displayAvatarURL())
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
    const banHistory = historyToField(dbUser.ban_history, message.client);
    if (banHistory) fields.push({ name: "Ban History", value: banHistory });

    const bonkHistory = historyToField(dbUser.bonk_history, message.client);
    if (bonkHistory) fields.push({ name: "Bonk History", value: bonkHistory });

    const kickHistory = historyToField(dbUser.kick_history, message.client);
    if (kickHistory) fields.push({ name: "Kick History", value: kickHistory });

    const muteHistory = historyToField(dbUser.mute_history, message.client);
    if (muteHistory) fields.push({ name: "Mute History", value: muteHistory });
  }

  return fields;
}

function historyToField(history: Kick[], client: Client): string | null {
  if (history.length === 0) {
    return null;
  }

  const historyString = history.reduce((acc, kick) => {
    const kicker = client.users.cache.get(`${kick.casted_by}`)!.username || kick.casted_by;
    return `${acc}${kick.reason} by ${kicker}\n`;
  }, "");

  return `\`\`\`\n${historyString}\`\`\``;
}
