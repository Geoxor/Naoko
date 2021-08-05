import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { IMessage } from "../../types";

export default {
  name: "np",
  description: "Shows you the currently playing song",
  requiresProcessing: true,
  execute: async (message: IMessage) => {
    return musicMiddleware(message, async (channel, player) => {
      return await player.createNowPlayingEmbed();
    });
  },
};
