import { SLURS } from "../../constants";
import { randomChoice } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "say",
  category: "FUN",
  usage: "say <sentence>",
  description: "Say your stupid message",
  execute: async (message) => {
    if (message.args.length === 0) return `What do you want to say ${randomChoice(SLURS)}`;
    message.delete().catch(() => {});
    return message.args.join(" ");
  },
});
