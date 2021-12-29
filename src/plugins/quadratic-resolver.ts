import { SLURS } from "../constants";
import { randomChoice, weightedRandomChoice } from "../logic/logic.shaii";
import { definePlugin } from "../shaii/Plugin.shaii";
import { defineCommand } from "../types";
import { D2Polynom, extractFactors } from "./logic/quadratic-resolver";

const solve = defineCommand({
  name: "solve",
  category: "UTILITY",
  usage: "solve <polynom>",
  description: "Solve your degree-2 polynom",
  execute: async (message) => {
    if (message.args.length === 0) return `What do you want to solve ${randomChoice(SLURS)}`;

    // some easter eggs :tro:
    switch (message.args.join(" ").toLowerCase()) {
      case "geoxor":
        return "You have problems";
      case "bobby":
        return "<:BobbyHQ:919698287236362290>";
      case "ur mom":
      case "your mom":
        return "bro it's too big";
      case "windows":
      case "macos":
        return "https://cdn.discordapp.com/attachments/920806500828606474/925491933969809449/you-should-install-linux-now.png";
      case "where to find keqing":
        return "The equation where to find keqing has 1 solution in R: touch grass";
    }

    let [a, b, c] = extractFactors(message.args.join(" "));
    if (!a || !b)
      return weightedRandomChoice(
        new Map()
          .set(0.99, `I can only solve polynoms of degree 2 ${randomChoice(SLURS)}`)
          .set(0.01, "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
      );
    return new D2Polynom(a, b, c).solve();
  },
});

export default definePlugin({
  name: "@qexat/quadratic-resolver",
  version: "1.0.0",
  command: [solve],
});
