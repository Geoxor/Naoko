import { db } from "../../sakuria/Database.sakuria";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "kick",
  description: "Kicks a user",
  requiresProcessing: false,
  execute: async (message) => {
    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "please mention the user you wanna kick";
    if (!message.member?.permissions.has("KICK_MEMBERS")) return "you don't have perms cunt";

    // Kick him
    await targetUser.kick();

    // Keep track of the kick
    await db.newKick(message.author.id, targetUser.id);

    // Get fucked
    return `Kicked user <@${targetUser.id}>`;
  },
});
