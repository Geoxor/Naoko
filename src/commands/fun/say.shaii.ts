import { defineCommand } from "../../types";

export default defineCommand({
  name: "say",
  description: "Says what you tell it",
  requiresProcessing: false,
  execute: (message) => {
    if (message.mentions.everyone) return "you can't make me tag everyone idiot";
    message.delete();
    return {
      content: message.args.join(" "),
      allowedMentions: { parse: [] }
    };
  },
});
