import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder().setName("play").setDescription("Start playing music from the music folder"),
  requiresProcessing: true,
  execute: async (interaction) => {
    return musicMiddleware(interaction, async (channel, player) => {
      await player.start(channel);
      await player.initQueue();
      return `Started playing ${player.nowPlayingFile}`;
    });
  },
});
