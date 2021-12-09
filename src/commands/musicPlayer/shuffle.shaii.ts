import { musicMiddleware } from "../../middleware/musicMiddleware.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  category: "MUSIC",
  name: "shuffle",
  aliases: [],
  description: "Shuffles the queue",
  requiresProcessing: false,
  execute: async (message) => {
    return musicMiddleware(message, async (channel, player) => {
      player.shuffle();
      return "playlist shuffled";
    });
  },
});
