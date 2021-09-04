import InventoryManager from "../../sakuria/InventoryManager.sakuria";
import { CommandType, defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder().setName("inventory").setDescription("Shows the inventory of the user"),
  requiresProcessing: false,
  type: CommandType.ECONOMY,
  execute: async (interaction) => {
    try {
      const embed = await InventoryManager.getInventory(interaction.user);
      return { embeds: [embed] };
    } catch (error) {
      return "You don't have an inventory";
    }
  },
});
