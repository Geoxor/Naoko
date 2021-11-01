import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "queue",
  description: "Shows you the current queue",
  requiresProcessing: false,
  execute: async (message) => {
    return musicMiddleware(message, async (channel, player) => {
      return player.queue.join("\n").substr(0, 2000);
    });
  },
});
