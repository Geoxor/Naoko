import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "volume",
  description: "Change the volume of the music player",
  requiresProcessing: false,
  execute: async (message) => {
    return musicMiddleware(message, async (channel, player) => {
      return player.changeVolume(parseFloat(message.args[0])) || "Volume changed";
    });
  },
});
