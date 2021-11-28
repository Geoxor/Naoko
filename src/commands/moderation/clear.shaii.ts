import { DiscordAPIError, TextChannel } from "discord.js";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "clear",
  description: "Bulk delete messages up to 100",
  permissions: ["MANAGE_MESSAGES"],
  requiresProcessing: false,
  execute: async (message) => {
    let count = parseFloat(message.args[0]) + 1;
    count = count > 100 ? 100 : count;
    // Will return if count is not a string.
    if (isNaN(count)) return `⚠️ when not number`;

    try {
      await (message.channel as TextChannel).bulkDelete(count);
      return `Cleared ${count} messages!`;
    } catch (error: any) {
      const err = error as DiscordAPIError;
      return err.message;
    }
  },
});
