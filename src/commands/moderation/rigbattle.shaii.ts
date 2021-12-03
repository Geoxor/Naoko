import Discord from "discord.js";
import { rigChooseWaifu } from "../../logic/logic.shaii";
import Waifu from "../../shaii/Waifu.shaii";
import WaifuBattle from "../../shaii/WaifuBattle.shaii";
import { defineCommand, IMessage } from "../../types";

export default defineCommand({
  name: "rigbattle",
  description: "Battle with predefined waifu for testing purpose",
  requiresProcessing: false,
  permissions: ["ADMINISTRATOR"],
  execute: async (message) => {
    if (!(message.channel instanceof Discord.TextChannel)) return "Can't start battles in here!";
    const result = await rigChooseWaifu(message.args.join(" "));
    if (!result) return "That waifu doesn't exist";
    const { chosenWaifu, chosenRarity } = result;
    const battle = new WaifuBattle(message.author, message.channel, new Waifu(chosenWaifu, chosenRarity));
    await battle.startBattle();
    return;
  },
});
