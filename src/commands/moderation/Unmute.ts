import command from '../../decorators/command';
import { MUTED_ROLE_ID } from "../../constants";
import { User } from "../../naoko/Database";
import { logger } from "../../naoko/Logger";
import { CommandExecuteResponse, IMessage, defineCommand } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import { sendUnmuteEmbed } from "./Mute";

@command()
class Unmute extends AbstractCommand {
  async execute(message: IMessage): Promise<CommandExecuteResponse> {
    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "Please mention the user you want to unmute";
    if (targetUser.id === message.author.id) return "You can't unmute yourself";

    const reason = message.args.join(" ");

    // Unget rekt
    await targetUser.roles.remove(MUTED_ROLE_ID);
    await targetUser.timeout(0 && Date.now(), reason);

    // Keep track of the unmute
    await User.unmute(message.author.id, targetUser.id, reason).catch(() => logger.error("Unmute database update failed"));

    // Send the embed
    sendUnmuteEmbed(message, targetUser, reason);
  }

  get commandData(): CommandData {
    return {
      name: "unmute",
      category: "MODERATION",
      usage: "unmute <@user> [reason]",
      description: "Unmute a user",
      permissions: ["ManageRoles"],
    }
  }
}
