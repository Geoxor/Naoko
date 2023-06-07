import Discord, { codeBlock } from "discord.js";
import { GEOXOR_GUILD_ID, SHAII_ID } from "../constants";
import { config } from "../naoko/Config";
import { logger } from "../naoko/Logger";

export function logEdit(
  oldMessage: Discord.Message | Discord.PartialMessage,
  newMessage: Discord.Message | Discord.PartialMessage,
  next: (oldMessage: Discord.Message | Discord.PartialMessage, newMessage: Discord.Message | Discord.PartialMessage) => any
): void {
  if (oldMessage.channel.type == Discord.ChannelType.DM) return;
  if (oldMessage.content == newMessage.content) return;
  if (oldMessage.author?.id === SHAII_ID) return;
  if (oldMessage.guild?.id !== GEOXOR_GUILD_ID) return;

  const embed = new Discord.EmbedBuilder()
    .setColor("#fff06e")
    .setTitle(`Message edited in #${oldMessage.channel.name}`)
    .setAuthor({ name: oldMessage.author!.username, iconURL: oldMessage.author?.avatarURL() || oldMessage.author?.defaultAvatarURL })
    .setThumbnail(`${oldMessage.author?.avatarURL()}`)
    .addFields(
      { name: `Message Author`, value: `<@${oldMessage.author?.id}>` },
      { name: `From`, value: codeBlock(oldMessage.content?.substring(0, 480) || 'N/A') },
      { name: `To`, value: codeBlock(newMessage.content?.substring(0, 480) || 'N/A') },
      {
        name: `Link`,
        value: `https://canary.discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`,
      }
    ).setTimestamp();

  const logChannel = oldMessage.client.channels.cache.get(config.chatLogChannel) as Discord.TextChannel;

  logChannel.send({ embeds: [embed] }).catch(() => { });
  logger.print(`Message edited at #${oldMessage.channel.name} by ${oldMessage.author?.username}`);

  next(oldMessage, newMessage);
}

export function logDelete(
  message: Discord.Message | Discord.PartialMessage,
  next?: (message: Discord.Message | Discord.PartialMessage) => any
) {
  if (message.channel.type == Discord.ChannelType.DM) return;
  if (message.author?.id === SHAII_ID) return;

  const embed = new Discord.EmbedBuilder()
    .setColor("#eb4034")
    .setTitle(`Message deleted in #${message.channel.name}`)
    .setAuthor({ name: message.author!.username, iconURL: message.author?.avatarURL() || message.author?.defaultAvatarURL })
    .setThumbnail(`${message.author?.avatarURL()}`)
    .addFields(
      { name: `Message Author`, value: `<@${message.author?.id}>` },
      { name: `Message Content`, value: codeBlock(message.content?.substring(0, 960) || 'N/A') },
      {
        name: `Link`,
        value: `https://canary.discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`,
      }
    )
    .setTimestamp();

  const logChannel = message.client.channels.cache.get(config.chatLogChannel) as Discord.TextChannel;

  logChannel.send({ embeds: [embed] }).catch(() => { });
  logger.print(`Message deleted at #${message.channel.name} by ${message.author?.username}`);

  next && next(message);
}
