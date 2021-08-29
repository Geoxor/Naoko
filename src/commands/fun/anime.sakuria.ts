import { defineCommand } from "../../types";
import { animeQuery } from "../../logic/logic.sakuria";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("anime")
    .setDescription("Looks up an anime on Anilist")
    .addStringOption((option) =>
      option.setName("query").setDescription("the anime to search for").setRequired(true)
    ),
  requiresProcessing: true,
  execute: async (interaction) => animeQuery(interaction.options.getString("query", true)),
});
