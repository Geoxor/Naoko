import Discord from "discord.js";
import WaifuBattle from "../../sakuria/WaifuBattle.sakuria";
import { defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("battle")
    .setDescription("Battle a random waifu with your friends for rewards!"),
  requiresProcessing: false,
  execute: async (interaction) => {
    if (!(interaction.channel instanceof Discord.TextChannel)) return "Can't start battles in here!";
    const battle = new WaifuBattle(interaction.user, interaction.channel);
    await battle.startBattle();
    return;
  },
});
