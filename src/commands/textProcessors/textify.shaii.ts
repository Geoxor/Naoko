import { defineCommand } from "../../types";
import { textify } from "../../logic/textProcessors.shaii";
import { SLURS } from "../../constants";
import { randomChoice } from "../../logic/logic.shaii";

export default defineCommand({
  name: "textify",
  aliases: [],
  usage: "textify <...processor_names> <text>",
  category: "TEXT_PROCESSORS",
  description: "Transform a sentence with a pipeline",
  requiresProcessing: true,
  execute: async (message) => {
    // can be IMPROVED
    let pipeline: string[] = [];
    let userSentence: string[] = [];
    let isArgCommand: boolean = true;
    message.args.forEach((arg) => {
      isArgCommand
        ? ["brainfuck", "britify", "spongify", "uwufy"].includes(arg)
          ? pipeline.push(arg)
          : ((isArgCommand = false), userSentence.push(arg))
        : userSentence.push(arg);
      if (pipeline.length > 10) return "pipeline can't be longer than 10 iterators";
    });
    const sentence = userSentence.join(" ");
    if (sentence.length > 2000) return `wtf your sentence is too big ${randomChoice(SLURS)}`;
    return textify(pipeline, sentence);
  },
});
