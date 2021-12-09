import { musicMiddleware } from "../../middleware/musicMiddleware.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "queue",
  aliases: ["q"],
  category: "MUSIC",
  description: "Shows you the current queue",
  requiresProcessing: false,
  execute: async (message) => {
    return musicMiddleware(message, async (channel, player) => {
      return player.queue.join("\n").substring(0, 2000);
    });
  },
});
