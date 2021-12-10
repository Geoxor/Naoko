import { spongify } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";
import { SLURS } from "../../constants";
import { randomChoice } from "../../logic/logic.shaii";

export default defineCommand({
  name: "spongify",
  category: "FUN",
  usage: "spongify <sentence>",
  aliases: [],
  description: "mAkEs YoU sPeAkInG lIkE ThAt",
  requiresProcessing: false,
  execute: async (message) => {
    if (message.args.length === 0) return `what do you want to SpOnGiFy ${randomChoice(SLURS)}`;
    return spongify(message.args.join(" "), randomChoice([true, false]));
  },
});
