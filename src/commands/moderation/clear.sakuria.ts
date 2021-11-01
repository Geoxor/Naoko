import { DiscordAPIError, TextChannel } from "discord.js";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "clear",
  description: "Bulk delete messages up to 100",
  requiresProcessing: false,
  execute: async (message) => {
    if (!message.member?.permissions.has("MANAGE_MESSAGES")) return "you don't have perms cunt";
    let count = parseInt(message.args[0]) + 1;
    count = count > 100 ? 100 : count;
    // Will return if count is not a string.
    if (isNaN(count)) return `⚠️ when not number`;

    try {
      await (message.channel as TextChannel).bulkDelete(count);
      return `Cleared ${count} messages!`;
    } catch (error) {
      const err = error as DiscordAPIError;
      return err.message;
    }
  },
});
