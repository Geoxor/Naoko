import { textToBritify } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "britify",
  aliases: [],
  usage: "britify <sentence>",
  category: "TEXT_PROCESSORS",
  description: "Transforms your sentence to british",
  requiresProcessing: false,
  execute: async (message) => {
    if (message.args.length === 0) return "tell me what u want in bri'ish cunt";
    return textToBritify(message.args.join(" "));
  },
});
