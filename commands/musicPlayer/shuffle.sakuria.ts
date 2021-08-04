import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { IMessage } from "../../types";

export default {
  name: "shuffle",
  description: "shuffles the queue",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<string> => {
    return musicMiddleware(message, async (channel, player) => {
      player.shuffle();
      return "playlist shuffled";
    });
  },
};
