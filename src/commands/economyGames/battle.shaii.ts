// import Discord from "discord.js";
// import WaifuBattle from "../../shaii/WaifuBattle.shaii";
// import { defineCommand, IMessage } from "../../types";

// export default defineCommand({
//   name: "battle",
//   description: "Battle a random waifu with your friends for rewards!",
//   requiresProcessing: false,
//   execute: async (message) => {
//     if (!(message.channel instanceof Discord.TextChannel)) return "Can't start battles in here!";
//     const battle = new WaifuBattle(message.author, message.channel);
//     await battle.startBattle();
//     return;
//   },
// });
