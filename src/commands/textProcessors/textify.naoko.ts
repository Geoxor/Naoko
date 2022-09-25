import { SLURS } from "../../constants";
import { randomChoice } from "../../logic/logic.naoko";
import { textify } from "../../logic/textProcessors.naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "textify",
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
      if (pipeline.length === 0) return "Pipeline can't be empty";
      if (pipeline.length > 10) return "Pipeline can't be longer than 10 iterators";
    });
    if (userSentence.length === 0) return `What do you want to textify ${randomChoice(SLURS)}`;
    const sentence = userSentence.join(" ");
    if (sentence.length > 2000) return `wtf your sentence is too big ${randomChoice(SLURS)}`;
    return textify(pipeline, sentence);
  },
});
