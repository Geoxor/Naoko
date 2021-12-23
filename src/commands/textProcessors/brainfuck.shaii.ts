import { textToBrainfuck } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";
import { SLURS } from "../../constants";
import { randomChoice } from "../../logic/logic.shaii";
import { Readable } from "stream";

export default defineCommand({
  name: "brainfuck",
  category: "TEXT_PROCESSORS",
  usage: "brainfuck <sentence>",
  aliases: [],
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
