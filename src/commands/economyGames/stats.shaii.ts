import Discord from "discord.js";
import InventoryManager from "../../shaii/InventoryManager.shaii";
import { defineCommand, IMessage } from "../../types";

export default defineCommand({
  name: "stats",
  usage: "stats",
  category: "ECONOMY",

  description: "Shows the statistics of the user",

  execute: async (message) => {
    try {
      const embed = await InventoryManager.getStatistics(message.author);
      return { embeds: [embed] };
    } catch (error: any) {
      return "You don't have statistics";
    }
  },
});
