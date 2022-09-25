import Discord from "discord.js";
import Waifu from "../../naoko/Waifu.naoko";
import WaifuBattle from "../../naoko/WaifuBattle.naoko";
import { chooseWaifu } from "../../naoko/WaifuRarities.naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "battle",
  category: "ECONOMY",
  usage: "Battle",
  description: "Battle a random waifu with your friends for rewards!",
  execute: async (message) => {
    if (!(message.channel instanceof Discord.TextChannel)) return "Can't start battles in here!";
    const { chosenWaifu, chosenRarity } = chooseWaifu();

    const battle = new WaifuBattle(message.author, message.channel, new Waifu(chosenWaifu, chosenRarity));
    await battle.startBattle();
    return;
  },
});
