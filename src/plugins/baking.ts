import { CAKES, PIES } from "../plugins/baking-const/baking";
import { randomChoice } from "../logic/logic";
import { definePlugin } from "../naoko/Plugin";
import { defineCommand } from "../types";

const bake = defineCommand({
  name: "bake",
  category: "FUN",
  usage: "bake <what-to-bake>",
  description: "Bake something",
  execute: async (message) => {
    if (message.args.length === 0) return `What do you want to bake`;

    // the baked goods + easter eggs
    switch (message.args.join(" ").toLowerCase()) {
      case "cake":
        return `${randomChoice(CAKES)}`;
      case "pie":
        return `${randomChoice(PIES)}`;
      case "OFC":
        return "https://cdn.discordapp.com/attachments/963948583806205962/963971146074705920/shit.png";
    }
  },
});

export default definePlugin({
  name: "@shkoop/baking",
  version: "1.0.0",
  command: [bake],
});
