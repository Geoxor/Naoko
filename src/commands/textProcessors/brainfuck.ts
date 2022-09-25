import { Readable } from "stream";
import { randomChoice, textToBrainfuck } from "../../logic/logic";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "brainfuck",
  category: "TEXT_PROCESSORS",
  usage: "brainfuck <sentence>",
  description: "Translates your sentence to brainfuck esoteric language",
  execute: async (message) => {
    if (message.args.length === 0) return `What to you want to translate`;
    const response: string = textToBrainfuck(message.args.join(" "));
    if (response.length > 2000) {
      return {
        content: "Bro the result is too big gonna put it in a file",
        files: [{ name: "shit.bf", attachment: Readable.from(response) }],
      };
    }
    return response;
  },
});
