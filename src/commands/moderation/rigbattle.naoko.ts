import Discord from "discord.js";
import Waifu from "../../naoko/Waifu.naoko";
import WaifuBattle from "../../naoko/WaifuBattle.naoko";
import { rigChooseWaifu } from "../../naoko/WaifuRarities.naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  category: "MODERATION",
  name: "rigbattle",
  usage: "rigbattle <waifu_name>",
  description: "Battle with predefined waifu for testing purpose",
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
