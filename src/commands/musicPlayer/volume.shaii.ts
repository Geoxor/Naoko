import { musicMiddleware } from "../../middleware/musicMiddleware.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "volume",
  category: "MUSIC",
  usage: "vol <volume>",
  aliases: ["vol"],
  description: "Change the volume of the music player",
  execute: async message => {
    return musicMiddleware(message, async (channel, player) => {
      return player.changeVolume(parseFloat(message.args[0])) || "Volume changed";
    });
  },
});
