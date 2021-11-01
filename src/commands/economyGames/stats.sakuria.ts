import Discord from "discord.js";
import InventoryManager from "../../sakuria/InventoryManager.sakuria";
import { defineCommand, IMessage } from "../../types";

export default defineCommand({
  name: "stats",
  description: "Shows the statistics of the user",
  requiresProcessing: false,
  execute: async (message) => {
    try {
      const embed = await InventoryManager.getStatistics(message.author);
      return { embeds: [embed] };
    } catch (error: any) {
      return "You don't have statistics";
    }
  },
});
