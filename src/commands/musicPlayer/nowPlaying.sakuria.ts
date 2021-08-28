import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { defineCommand } from "../../types";
import { SlashCommandBuilder } from '@discordjs/builders';

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("np")
    .setDescription("Shows you the currently playing song"),
  requiresProcessing: true,
  execute: async (interaction) => {
    return musicMiddleware(interaction, async (channel, player) => {
      return await player.createNowPlayingEmbed();
    });
  },
});
