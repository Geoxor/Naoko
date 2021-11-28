import { encodeMorse, decodeMorse } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "morse",
  description: "Encodes a string to morse code",
  requiresProcessing: false,
  execute: async (message) => {
    // Reply if no args
    if (message.args.length === 0) return "Give me a string to encode!";
    let messageContent: string = message.args.join(" ");
    if (messageContent.length / messageContent.replace(/[\-./\s]/g, "").length > 1.5)
      return decodeMorse(messageContent).substr(0, 2000);
    else return encodeMorse(messageContent).substr(0, 2000);
  },
});
