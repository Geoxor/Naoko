import Discord from "discord.js";
import { SHAII_LOGO } from "../../constants";
import command from '../../decorators/command';
import { User } from "../../naoko/Database";
import { logger } from "../../naoko/Logger";
import Naoko from "../../naoko/Naoko";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';

@command()
class Unban extends AbstractCommand {
  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const args = payload.get('args');
    const message = payload.get('message');

    if (args.length === 0) return "Please enter the ID of the user you want to unban";
    const targetUser = await Naoko.bot.users.fetch(args[0]);
    if (!targetUser) return "Please enter a valid user ID";
    if (targetUser.id === message.author.id) return "You can't unban yourself";

    args.shift(); // remove the user ID
    const reason = args.join(" ");

    // Create the result embed
    const embed = new Discord.EmbedBuilder()
      .setTitle(`Unban - ${targetUser.tag}`)
      .setDescription(`ID: ${targetUser.id}, <@${targetUser.id}>`)
      .setThumbnail(targetUser.avatarURL() || message.author.defaultAvatarURL)
      .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() || message.author.defaultAvatarURL })
      .setTimestamp()
      .addFields({ name: "Reason", value: reason || "No reason given", inline: true })
      .setFooter({ text: Naoko.version, iconURL: SHAII_LOGO })
      .setColor("#00FF00");

    try {
      await targetUser.send({ embeds: [embed] });
    } catch {
      await message.reply(`I couldn't DM ${targetUser.username} the embed, probably has DMs disabled`);
    }

    setTimeout(() => {
      message.delete()
        .catch((error) => logger.error(`Failed to delete unban message ${error}`));
    }, 5000);

    // Get unfucked
    await message.guild?.members.unban(targetUser.id, reason);

    // Keep track of the unban
    await User.unban(message.author.id, targetUser.id, reason);

    return { embeds: [embed] };
  }

  get commandData(): CommandData {
    return {
      name: "unban",
      category: "MODERATION",
      usage: "unban <user_id> <reason>",
      description: "Unbans a user",
      permissions: ["BanMembers"],
      aliases: ['pardon'],
    };
  }
}
