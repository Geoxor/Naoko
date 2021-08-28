import { defineCommand } from "../../types";
import { animeQuery } from "../../logic/logic.sakuria";
import { SlashCommandBuilder } from '@discordjs/builders';

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("anime")
    .setDescription("Looks up an anime on Anilist")
    .addStringOption(option => option
      .setName('query')
      .setDescription("the anime to search for")
      .setRequired(true)),
  execute: async (input) => animeQuery(input.options.getString('query', true))
});
