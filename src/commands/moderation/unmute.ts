import { MUTED_ROLE_ID } from "../../constants";
import { User } from "../../naoko/Database";
import { logger } from "../../naoko/Logger";
import { defineCommand } from "../../types";
import { sendUnmuteEmbed } from "./mute";

export default defineCommand({
  name: "unmute",
  category: "MODERATION",
  usage: "unmute <@user> [reason]",
  description: "Unmute a user",
  permissions: ["ManageRoles"],
  execute: async (message) => {
    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "Please mention the user you want to unmute";
    if (targetUser.id === message.author.id) return "You can't unmute yourself";

    const reason = message.args.join(" ");

    // Unget rekt
    await targetUser.roles.remove(MUTED_ROLE_ID);
    await targetUser.timeout(0 && Date.now(), reason);

    // Keep track of the unmute
    await User.unmute(message.author.id, targetUser.id, reason).catch(() => logger.error("Unmute database update failed"));

    logger.print(reason);
    // Send the embed
    sendUnmuteEmbed(message, targetUser, reason);
  },
});
