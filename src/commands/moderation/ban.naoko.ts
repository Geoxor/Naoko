import Discord, { GuildMember, TextChannel } from "discord.js";
import Naoko from "../../naoko/Naoko.naoko";
import { GEOXOR_GENERAL_CHANNEL_ID, GEOXOR_GUILD_ID, SHAII_ID, SHAII_LOGO } from "../../constants";
import { User } from "../../naoko/Database.naoko";
import logger from "../../naoko/Logger.naoko";
import { defineCommand, IMessage } from "../../types";

export const sendToGeneral = (message: string | Discord.MessagePayload | Discord.MessageOptions) => {
  const general = Naoko.bot.guilds.cache.get(GEOXOR_GUILD_ID)!.channels.cache.get(GEOXOR_GENERAL_CHANNEL_ID)! as TextChannel;
  return general.send(message);
}

export const ban = async (target: GuildMember, message?: IMessage, reason?: string) => {
  if (message && (target.id === message.author.id)) return "You can't ban yourself";
  if (target.permissions.has("ADMINISTRATOR")) return "You can't ban other admins";

  // Create the result embed
  const embed = {
    embeds: [new Discord.MessageEmbed()
      .setTitle(`Ban - ${target.user.tag}`)
      .setDescription(`ID: ${target.user.id}, <@${target.user.id}>`)
      .setThumbnail(target.user.avatarURL() || (message ? message.author.defaultAvatarURL : SHAII_LOGO))
      .setTimestamp()
      .addField("Reason", (reason || message?.args.join(" ") || "No reason given") + `- at ${Date.now()}`, true)
      .setColor("#FF0000")]
  }

  try {
    await target.send(embed)
    await target.ban({ reason })
    if (!message) await sendToGeneral(embed)
    await User.ban(message ? message.author.id : SHAII_ID, target.id, reason)
  } catch (error) {
    logger.error(error as string);
  }

  return embed;
}

export default defineCommand({
  name: "ban",
  aliases: ["yeet"],
  category: "MODERATION",
  usage: "ban <@user> <reason>",
  description: "Bans a user",
  permissions: ["BAN_MEMBERS"],
  execute: async (message) => {
    const target = message.mentions.members?.first();
    if (!target) return "Please mention the user you want to ban";
    ban(target, message).catch();
  },
});
