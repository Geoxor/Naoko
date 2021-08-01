import { encodeMorse, decodeMorse } from "../logic/logic.sakuria";
import { IMessage } from "../types";

export const command = {
  name: "mors",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<string> => {
    // Reply if no args
    if (message.args.length === 0) return "Give me a string to encode!";
    let messageContent: string = message.args.join(" ");
    if ((messageContent.length / messageContent.replace(/[\-./\s]/g, "").length) > 1.5) return decodeMorse(messageContent).substr(0, 2000)
    else return encodeMorse(messageContent).substr(0, 2000);
  }
};
