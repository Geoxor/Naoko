import Discord, { GuildMember, Message } from "discord.js";
import { NAOKO_LOGO } from "../../../constants";
import MessageCreatePayload from "../../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../../types";
import Naoko from "../../../naoko/Naoko";
import { User } from '../../../naoko/Database';
import AbstractCommand, { CommandData } from "../../AbstractCommand";
import Logger from "../../../naoko/Logger";
import { singleton } from "@triptyk/tsyringe";

@singleton()
export class Ban extends AbstractCommand {
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
        .setTitle(`Ban - ${target.user.username}`)
        .setDescription(`ID: ${target.user.id}, <@${target.user.id}>`)
        .setThumbnail(target.user.avatarURL() || (message ? message.author.defaultAvatarURL : NAOKO_LOGO))
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
      usage: "<@user> [<reason>]",
      description: "Bans a user",
      permissions: ["BanMembers"],
    }
  }
}

@singleton()
export class Unban extends AbstractCommand {
  constructor(
    private logger: Logger,
  ) {
    super();
  }

  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const args = payload.get('args');
    const message = payload.get('message');

    if (args.length === 0) return "Please enter the ID of the user you want to unban";
    const targetUser = await message.client.users.fetch(args[0]);
    if (!targetUser) return "Please enter a valid user ID";
    if (targetUser.id === message.author.id) return "You can't unban yourself";

    args.shift(); // remove the user ID
    const reason = args.join(" ");

    // Create the result embed
    const embed = new Discord.EmbedBuilder()
      .setTitle(`Unban - ${targetUser.username}`)
      .setDescription(`ID: ${targetUser.id}, <@${targetUser.id}>`)
      .setThumbnail(targetUser.avatarURL() || message.author.defaultAvatarURL)
      .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() || message.author.defaultAvatarURL })
      .setTimestamp()
      .addFields({ name: "Reason", value: reason || "No reason given", inline: true })
      .setFooter({ text: Naoko.version, iconURL: NAOKO_LOGO })
      .setColor("#00FF00");

    try {
      await targetUser.send({ embeds: [embed] });
    } catch {
      await message.reply(`I couldn't DM ${targetUser.username} the embed, probably has DMs disabled`);
    }

    setTimeout(() => {
      message.delete()
        .catch((error) => this.logger.error(`Failed to delete unban message ${error}`));
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
      usage: "<user-id> [<reason>]",
      description: "Unbans a user",
      permissions: ["BanMembers"],
      aliases: ['pardon'],
    };
  }
}
