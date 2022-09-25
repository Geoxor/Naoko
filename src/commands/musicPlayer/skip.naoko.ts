import { musicMiddleware } from "../../middleware/musicMiddleware.naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  category: "MUSIC",
  name: "skip",
  usage: "skip",
  aliases: ["next"],
  description: "Skips to the next song in the queue",
  execute: async (message) => {
    return musicMiddleware(message, async (channel, player) => {
      player.skip();
      return await player.createNowPlayingEmbed(true);
    });
  },
});
