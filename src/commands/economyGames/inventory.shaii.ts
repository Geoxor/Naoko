import InventoryManager from "../../shaii/InventoryManager.shaii";
import logger from "../../shaii/Logger.shaii";
import { defineCommand } from "../../types";
export default defineCommand({
  name: "inventory",
  category: "ECONOMY",
  aliases: ["inv"],
  usage: "inv",
  description: "Shows the inventory of the user",
  execute: async message => {
    try {
      const embed = await InventoryManager.getInventory(message.author);
      return { embeds: [embed] };
    } catch (error: any) {
      logger.error(error as string);
      return "You don't have an inventory";
    }
  },
});
