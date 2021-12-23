import { textToBritify } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "britify",
  aliases: [],
  usage: "britify <sentence>",
  category: "TEXT_PROCESSORS",
  description: "Transforms your sentence to british",

  execute: async (message) => {
    if (message.args.length === 0) return "Tell me whad u wan' in bri'ish cunt";
    return textToBritify(message.args.join(" "));
  },
});
