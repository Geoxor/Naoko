import InventoryManager from "../../sakuria/InventoryManager.sakuria";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "inventory",
  description: "Shows the inventory of the user",
  requiresProcessing: false,
  execute: async (message) => {
    try {
      const embed = await InventoryManager.getInventory(message.author);
      return { embeds: [embed] };
    } catch (error) {
      return "You don't have an inventory";
    }
  },
});
