import { DiscordAPIError, TextChannel } from "discord.js";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "whois",
  description: "Bulk delete messages up to 100",
  requiresProcessing: false,
  execute: async (message) => {
    if (!message.mentions.members?.first()) {
      
      console.log('who is');
      
    }
  },
});
