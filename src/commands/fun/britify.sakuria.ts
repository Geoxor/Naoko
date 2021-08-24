import { britify } from "../../logic/logic.sakuria";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "britify",
  description: "Transforms your sentence to british",
  requiresProcessing: false,
  execute: async (message) => {
    if (message.args.length === 0) return "tell me what u want in bri'ish cunt";
    return britify(message.args.join(" "));
  },
});
