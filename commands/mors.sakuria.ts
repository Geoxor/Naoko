import { encodeMorse } from "../logic/logic.sakuria";
import { IMessage } from "../types";

export const command = {
  name: "mors",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<string> => {
    // Reply if no args
    if (message.args.length === 0) return "Give me a string to encode!";
    return encodeMorse(message.args.join("")).substr(0, 2000);
  },
};
