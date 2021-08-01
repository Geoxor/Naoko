import { decodeMorse } from "../logic/logic.sakuria";
import { IMessage } from "../types";

export const command = {
    name: "decode",
    requiresProcessing: false,
    execute: async (message: IMessage): Promise<string> => {
      // Reply if no args
      if (message.args.length === 0) return "Give me a string to decode!";
      return decodeMorse(message.args.join(" ")).substr(0, 2000);
    },
  };
  