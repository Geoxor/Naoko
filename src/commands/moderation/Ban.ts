import Discord, { GuildMember, Message } from "discord.js";
import { SHAII_LOGO } from "../../constants";
import command from '../../decorators/command';
import { User } from "../../naoko/Database";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';

@command()
class Ban extends AbstractCommand {
  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const message = payload.get('message');
    const args = payload.get('args');

    const target = message.mentions.members?.first();
    if (!target) {
      return "Please mention the user you want to ban";
    }

    if (target.id === message.author.id) {
      return "You can't ban yourself";
    }
    if (target.permissions.has("Administrator")) {
      return "You can't ban other admins";
    }

    const reason = args.join(" ") || 'No reason given';

    this.doBan(target, message, reason).catch();
  }

  private async doBan(target: GuildMember, message: Message, reason: string) {
    // Create the result embed
    const responseMessage = {
      embeds: [new Discord.EmbedBuilder()
        .setTitle(`Ban - ${target.user.tag}`)
        .setDescription(`ID: ${target.user.id}, <@${target.user.id}>`)
        .setThumbnail(target.user.avatarURL() || (message ? message.author.defaultAvatarURL : SHAII_LOGO))
        .setTimestamp()
        .addFields({
          name: "Reason",
          value: reason + `- at ${Date.now()}`,
          inline: true,
        })
        .setColor("#FF0000")],
    }

    try {
      await target.send(responseMessage);
    } catch {
      const embed = new Discord.EmbedBuilder()
        .setTitle('DM Failed')
        .setDescription(`I couldn't DM ${target}. They probably have they DM's closed`)
        .setColor('DarkRed');
      responseMessage.embeds.push(embed);
    }

    await target.ban({ reason });
    await User.ban(message.author.id, target.id, reason);

    return responseMessage;
  }

  get commandData(): CommandData {
    return {
      name: "ban",
      aliases: ["yeet"],
      category: "MODERATION",
      usage: "ban <@user> <reason>",
      description: "Bans a user",
      permissions: ["BanMembers"],
    }
  }
}
