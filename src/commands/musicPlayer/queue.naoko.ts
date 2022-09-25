import { musicMiddleware } from "../../middleware/musicMiddleware.naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "queue",
  usage: "q",
  aliases: ["q"],
  category: "MUSIC",
  description: "Shows you the current queue",
  execute: async (message) => {
    return musicMiddleware(message, async (channel, player) => {
      return player.queue.join("\n").substring(0, 2000);
    });
  },
});
