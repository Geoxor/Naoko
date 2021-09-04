import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { CommandType, defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder().setName("skip").setDescription("Skips to the next song in the queue"),
  type: CommandType.MUSIC_PLAYER,
  execute: async (interaction) => {
    return musicMiddleware(interaction, async (channel, player) => {
      player.skip();
      return "Skipped~!";
    });
  },
});
