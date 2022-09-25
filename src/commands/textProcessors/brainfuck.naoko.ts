import { Readable } from "stream";
import { SLURS } from "../../constants";
import { randomChoice, textToBrainfuck } from "../../logic/logic.naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "brainfuck",
  category: "TEXT_PROCESSORS",
  usage: "brainfuck <sentence>",
  description: "Translates your sentence to brainfuck esoteric language",
  execute: async (message) => {
    if (message.args.length === 0) return `What to you want to translate ${randomChoice(SLURS)}`;
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
