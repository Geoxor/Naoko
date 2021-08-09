import { MessageOptions } from "discord.js";
import { randomDickSize } from "../../logic/logic.sakuria";
import { IMessage } from "../../types";
import { Readable } from "stream";

export default {
  name: "dicksize",
  description: "Tell's you your dicksize or battle against someone else's dicksize!",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<string | MessageOptions> => {
    if (message.mentions.members && message.mentions.members.size !== 0) {
      const dicksize = randomDickSize();
      const enemyDicksize = randomDickSize();

      if (dicksize + enemyDicksize > 1900) {
        return {
          content:
            `This battle of the dongs is too much to just say as is, so here's the brief:\n` +
            `<@${message.author}>: ${dicksize}cm\n` +
            `<@${message.mentions.members.first()}>: ${enemyDicksize}cm` +
            `diff: ${Math.abs(dicksize - enemyDicksize)}cm` +
            `winner: <@${dicksize > enemyDicksize ? message.author : message.mentions.members.first()}>`,
          files: [
            {
              name: "battle.txt",
              attachment: Readable.from(
                `${message.author.username}'s long dong:\n 8${"=".repeat(dicksize)}D\n` +
                  `${message.mentions.users.first()?.username}'s long dong:\n 8${"=".repeat(enemyDicksize)}D\n`
              ),
            },
          ],
        };
      } else
        return `
        8${"=".repeat(dicksize)}D ${dicksize}cm <@${message.author}>
        8${"=".repeat(enemyDicksize)}D ${enemyDicksize}cm <@${message.mentions.members.first()}>
        diff: ${Math.abs(dicksize - enemyDicksize)}cm
        winner: <@${dicksize > enemyDicksize ? message.author : message.mentions.members.first()}>
      `;
    } else {
      const dicksize = randomDickSize();
      let response = `8${"=".repeat(dicksize)}D ${dicksize}cm`;

      if (response.length > 2000)
        return {
          content: "My goodness that's some schlong",
          files: [{ name: "magnum.txt", attachment: Readable.from(response) }],
        };
      else return response;
    }
  },
};
