import Discord from "discord.js";
import { definePlugin } from "../shaii/Plugin.shaii";
import { defineCommand } from "../types";
import { randomChoice } from "../logic/logic.shaii";
import { SLURS } from "../constants";
import { extractFactors, D2Polynom } from "./logic/eqresolver.logic";

const solve = defineCommand({
  name: "solve",
  category: "UTILITY",
  usage: "solve <polynom>",
  description: "Solve your degree-2 polynom",
  execute: async (message) => {
    if (message.args.length === 0) return `What do you want to solve ${randomChoice(SLURS)}`;
    let [a, b, c] = extractFactors(message.args.join(" "));
    if (!a || !b || !c) return `I can only resolve polynoms of degree 2 ${randomChoice(SLURS)}`;
    return new D2Polynom(a, b, c).solve();
  },
});

export default definePlugin({
  name: "@qexat/eqresolver",
  version: "1.0.0",
  command: [solve],
});
