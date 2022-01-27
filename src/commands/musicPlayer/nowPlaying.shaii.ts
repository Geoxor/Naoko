import { musicMiddleware } from "../../middleware/musicMiddleware.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "np",
  aliases: ["np", "playing", "nowPlaying"],
  usage: "np",
  category: "MUSIC",
  description: "Shows you the currently playing song",
  requiresProcessing: true,
  execute: async message => {
    return musicMiddleware(message, async (channel, player) => {
      return await player.createNowPlayingEmbed();
    });
  },
});
