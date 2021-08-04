import Discord from "discord.js";
import WaifuBattle from "../../sakuria/WaifuBattle.sakuria";
import { IMessage } from "../../types";

export default {
  name: "waifu",
  description: "Waifu battle a random waifu with your friends for rewards!",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<string | void> => {
    if (!(message.channel instanceof Discord.TextChannel)) return "Can't start battles in here!"
    const battle = new WaifuBattle(message.author, message.channel);
    await battle.startBattle();
    return;
  },
};
