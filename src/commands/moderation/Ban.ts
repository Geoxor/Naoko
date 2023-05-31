import Discord, { GuildMember } from "discord.js";
import { SHAII_LOGO } from "../../constants";
import { User } from "../../naoko/Database";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class Ban extends AbstractCommand {
  execute(message: IMessage): CommandExecuteResponse | Promise<CommandExecuteResponse> {
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

    const reason = message?.args.join(" ") || 'No reason given';

    this.doBan(target, message, reason).catch();
  }

  private async doBan(target: GuildMember, message: IMessage, reason: string) {
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
