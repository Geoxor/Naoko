import Discord from "discord.js";
import { tts } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "tts",
  category: "FUN",
  usage: "tts <sentence>",
  description: "Turn a string into text to speech",
  execute: async (message) => {
    try {
      const attachment = new Discord.MessageAttachment(
        await tts(message.args.join(" ")),
        `${message.args.slice(0, 6).join(" ")}.wav`
      );
      return { files: [attachment] };
    } catch {
      return ":x: Sorry, this command is not supported in this environment."
    }
  },
});
