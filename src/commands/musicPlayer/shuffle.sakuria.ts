import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { defineCommand } from "../../types";
import { SlashCommandBuilder } from '@discordjs/builders';

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffles the queue"),
  execute: async (interaction) => {
    return musicMiddleware(interaction, async (channel, player) => {
      player.shuffle();
      return "Playlist shuffled~!";
    });
  },
});
