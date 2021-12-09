import { britify } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "britify",
  aliases: [],
  description: "Transforms your sentence to british",
  requiresProcessing: false,
  execute: async (message) => {
    if (message.args.length === 0) return "tell me what u want in bri'ish cunt";
    return britify(message.args.join(" "));
  },
});
