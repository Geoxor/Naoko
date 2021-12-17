import { User } from "../../shaii/Database.shaii";
import { defineCommand } from "../../types";
import logger from "../../shaii/Logger.shaii";
import { MUTED_ROLE_ID } from "../../constants";
import { sendUnmuteEmbed } from "./mute.shaii";

export default defineCommand({
  name: "unmute",
  aliases: [],
  category: "MODERATION",
  usage: "unmute <@user> [reason]",
  description: "Unmute a user",
  permissions: ["MANAGE_ROLES"],
  requiresProcessing: true,
  execute: async (message) => {
    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "Please mention the user you want to unmute";
    if (targetUser.id === message.author.id) return "You can't unmute yourself";
    if (!targetUser.roles.cache.has(MUTED_ROLE_ID)) return "This user is not muted";

    const reason = message.args.join(" ");

    // Unget rekt
    await targetUser.roles.remove(MUTED_ROLE_ID);

    // Keep track of the unmute
    await User.unmute(message.author.id, targetUser.id, reason).catch(() => logger.error("Unmute database update failed"));

    logger.print(reason);
    // Send the embed
    sendUnmuteEmbed(message, targetUser, reason);
  },
});
