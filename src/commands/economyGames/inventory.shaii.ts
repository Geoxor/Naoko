import InventoryManager from "../../shaii/InventoryManager.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "inventory",
  category: "ECONOMY",
  aliases: ["inv"],
  description: "Shows the inventory of the user",
  requiresProcessing: false,
  execute: async (message) => {
    try {
      const embed = await InventoryManager.getInventory(message.author);
      return { embeds: [embed] };
    } catch (error: any) {
      console.log(error);
      return "You don't have an inventory";
    }
  },
});
