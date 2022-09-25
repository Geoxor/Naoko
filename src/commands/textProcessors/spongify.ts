import { randomChoice, textToSpongify } from "../../logic/logic";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "spongify",
  category: "TEXT_PROCESSORS",
  usage: "spongify <sentence>",
  description: "mAkEs YoU sPeAk lIkE ThIs",
  execute: async (message) => {
    if (message.args.length === 0) return `What do you want to SpOnGiFy`;
    return textToSpongify(message.args.join(" "), randomChoice([true, false]));
  },
});
