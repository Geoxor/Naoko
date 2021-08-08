import { musicMiddleware } from "../../middleware/musicMiddleware.sakuria";
import { IMessage } from "../../types";

export default {
  name: "shuffle",
  description: "Shuffles the queue",
  requiresProcessing: false,
  execute: async (message: IMessage) => {
    return musicMiddleware(message, async (channel, player) => {
      player.shuffle();
      return "playlist shuffled";
    });
  },
};
