import { textToSpongify } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";
import { SLURS } from "../../constants";
import { randomChoice } from "../../logic/logic.shaii";

export default defineCommand({
  name: "spongify",
  category: "TEXT_PROCESSORS",
  usage: "spongify <sentence>",
  aliases: [],
  description: "mAkEs YoU sPeAk lIkE ThIs",

  execute: async (message) => {
    if (message.args.length === 0) return `What do you want to SpOnGiFy ${randomChoice(SLURS)}`;
    return textToSpongify(message.args.join(" "), randomChoice([true, false]));
  },
});
