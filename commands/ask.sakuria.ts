import { IMessage } from "../types";
import answers from "../assets/answers.json";

export const command = {
  name: "ask",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<string> => {
    // Reply if no args
    if (message.args.length === 0) return "Yeah you gotta ask a question you know? you can't just fuckin tell me the command and ask nothing idiot";
    return answers[~~(Math.random() * answers.length - 1)];
  },
};
