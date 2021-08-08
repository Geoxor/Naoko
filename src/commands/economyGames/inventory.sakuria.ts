import Discord from "discord.js";
import InventoryManager from "../../sakuria/InventoryManager.sakuria";
import { IMessage } from "../../types";

export default {
  name: "inventory",
  description: "Shows the inventory of the user",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<Discord.MessageOptions | string> => {
    try {
      const embed = await InventoryManager.getInventory(message.author);
      return { embeds: [embed] };
    } catch (error) {
      return "You don't have an inventory";
    }
  },
};
