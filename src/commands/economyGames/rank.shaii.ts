// https://www.youtube.com/watch?v=iik25wqIuFo

import { DiscordAPIError, TextChannel } from "discord.js";
import Logger from "../../shaii/Logger.shaii";
import { defineCommand } from "../../types";

// Level formula
let formula = (level: number) => 1.3654321 * (((level - 10) * (level - 9)) / 2) ** 1.25 + 460 * (level - 10) + 2545;
const levels = [90, 215, 370, 555, 775, 1035, 1335, 1685, 2085, 2545];

// Calculate levels 10-300
for (let i = 10; i <= 300; i++) {
  const levelXP = ~~formula(i);
  levels.push(levelXP);
}

let resolveLevel = (xp: number) => {
  for (let i = 0; i < levels.length; i++) {
    if (levels[i] > xp) return i;
  }

  return 0;
};

let getXPForNextLevel = (xp: number) => {
  return levels[resolveLevel(xp)];
};

let getXPForCurrentLevel = (xp: number) => {
  return levels[resolveLevel(xp) - 1];
};

export default defineCommand({
  name: "rank",
  aliases: [],
  usage: "rank",
  category: "ECONOMY",
  description: "View your rank",
  requiresProcessing: false,
  execute: async (message) => {
    // @ts-ignore
    const { xp } = message.databaseUser;
    return xp.toString();
  },
});
