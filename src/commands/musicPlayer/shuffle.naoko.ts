import { musicMiddleware } from "../../middleware/musicMiddleware.naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "shuffle",
  category: "MUSIC",
  usage: "shuffle",
  description: "Shuffles the queue",
  execute: async (message) => {
    return musicMiddleware(message, async (channel, player) => {
      player.shuffle();
      return "Playlist shuffled";
    });
  },
});
