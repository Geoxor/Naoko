import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { IMessage } from "../../types";

export default {
  name: "skip",
  description: "Skips to the next song in the queue",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<string> => {
    return musicMiddleware(message, async (channel, player) => {
      player.skip();
      return 'Skipped';
    });
  },
};
