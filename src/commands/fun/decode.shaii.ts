import { decodeMorse } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "decode",
  category: "FUN",
  aliases: [],
  description: "Decodes morse code",
  requiresProcessing: false,
  execute: async (message) => {
    // Reply if no args
    if (message.args.length === 0) return "Give me a string to decode!";
    return decodeMorse(message.args.join(" ")).substring(0, 2000);
  },
});
