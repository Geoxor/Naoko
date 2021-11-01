import { User } from "../../sakuria/Database.sakuria";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "kick",
  description: "Kicks a user",
  requiresProcessing: false,
  execute: async (message) => {
    const targetUser = message.mentions.members?.first();
    if (!targetUser) return "please mention the user you wanna kick";
    if (targetUser.id === message.author.id) return "you can't kick urself";
    if (targetUser.permissions.has("ADMINISTRATOR")) return "you can't kick other admins";
    if (!message.member?.permissions.has("KICK_MEMBERS")) return "you don't have perms cunt";

    message.args.shift() // remove the mention
    const reason = message.args.join(" ");

    // Kick him
    await targetUser.kick();

    // Keep track of the kick
    await User.kick(message.author.id, targetUser.id, reason);

    // Get fucked
    return `Kicked user <@${targetUser.id}>`;
  },
});
