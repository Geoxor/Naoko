import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder().setName("skip").setDescription("Skips to the next song in the queue"),
  execute: async (interaction) => {
    return musicMiddleware(interaction, async (channel, player) => {
      player.skip();
      return "Skipped~!";
    });
  },
});
