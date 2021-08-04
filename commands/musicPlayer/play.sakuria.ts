import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { IMessage } from "../../types";

export default {
  name: "play",
  description: "Play a song",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<string> => {
    return musicMiddleware(message, async (channel, player) => {
      await player.start(channel);
      await player.initQueue();
      return "Started playing";
    });
  },
};
