import Discord from "discord.js";
import { SHAII_LOGO } from "../../constants";
import { User } from "../../naoko/Database";
import { logger } from "../../naoko/Logger";
import Naoko from "../../naoko/Naoko";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";

@command()
class Kick extends AbstractCommand {
  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get('message');
    const reason = payload.get('args').join(' ');

    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "Please mention the user you want to kick";
    if (targetUser.id === message.author.id) return "You can't kick yourself";
    if (targetUser.permissions.has("Administrator")) return "You can't kick other admins";

    // Create the result embed
    const embed = new Discord.EmbedBuilder()
      .setTitle(`Kick - ${targetUser.user.tag}`)
      .setDescription(`ID: ${targetUser.user.id}, <@${targetUser.user.id}>`)
      .setThumbnail(targetUser.user.avatarURL() || message.author.defaultAvatarURL)
      .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() || message.author.defaultAvatarURL })
      .setTimestamp()
      .addFields({ name: "Reason", value: reason || "No reason given", inline: true })
      .setFooter({ text: Naoko.version, iconURL: SHAII_LOGO })
      .setColor("#FF4500");

    targetUser
      .send({ embeds: [embed] })
      .catch(() => message.reply(`I couldn't DM ${targetUser.user.username} the embed, probably has DMs disabled`)
        .then(() => setTimeout(() => message.delete()
          .catch(), 5000)));

    // Kick him
    await targetUser.kick(reason);

    // Keep track of the kick
    await User.kick(message.author.id, targetUser.id, reason).catch(() => logger.error("Kick database update failed"));

    return { embeds: [embed] };
  }

  get commandData(): CommandData {
    return {
      name: "kick",
      usage: "kick <@user> <reason>",
      category: "MODERATION",
      description: "Kicks a user",
      permissions: ["KickMembers"],
    }
  }
}
