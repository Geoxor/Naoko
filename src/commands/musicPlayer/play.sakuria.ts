import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "play",
  description: "Play a song",
  requiresProcessing: false,
  execute: async (message) => {
    return musicMiddleware(message, async (channel, player) => {
      await player.start(channel);
      await player.initQueue();
      return await player.createNowPlayingEmbed();
    });
  },
});
