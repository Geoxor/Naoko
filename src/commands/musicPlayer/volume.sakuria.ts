import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { CommandType, defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Change the music's volume")
    .addIntegerOption((option) =>
      option.setName("volume").setDescription("the volume to set the music to").setRequired(true)
    ),
  type: CommandType.MUSIC_PLAYER,
  execute: async (interaction) => {
    return musicMiddleware(interaction, async (channel, player) => {
      const volume = interaction.options.getInteger("volume") || 1;
      player.changeVolume(volume);
      return `Volume changed to ${volume}`;
    });
  },
});
