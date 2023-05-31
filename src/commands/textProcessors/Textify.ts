import { textify } from "../../logic/textProcessors";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';

class Textify extends AbstractCommand {
  execute(message: IMessage): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    // TODO: can be IMPROVED
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
    if (userSentence.length === 0) return `What do you want to textify`;
    const sentence = userSentence.join(" ");
    if (sentence.length > 2000) return `wtf your sentence is too big`;
    return textify(pipeline, sentence);
  }

  get commandData(): CommandData {
    return {
      name: "textify",
      usage: "textify <...processor_names> <text>",
      category: "TEXT_PROCESSORS",
      description: "Transform a sentence with a pipeline",
      requiresProcessing: true,
    }
  }
}
