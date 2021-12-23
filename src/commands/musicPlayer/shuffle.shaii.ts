import { musicMiddleware } from "../../middleware/musicMiddleware.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "shuffle",
  category: "MUSIC",
  aliases: [],
  usage: "shuffle",
  description: "Shuffles the queue",

  execute: async (message) => {
    return musicMiddleware(message, async (channel, player) => {
      player.shuffle();
      return "Playlist shuffled";
    });
  },
});
