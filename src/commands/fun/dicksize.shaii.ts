import { MessageOptions } from "discord.js";
import { randomDickSize } from "../../logic/logic.shaii";
import { defineCommand, IMessage } from "../../types";
import { Readable } from "stream";

export default defineCommand({
  name: "dicksize",
  category: "FUN",
  usage: "dicksize ?<@user | user_id>",

  description: "Tells you your dicksize or battle against someone else's dicksize!",

  execute: async (message) => {
    if (
      message.mentions.members &&
      message.mentions.members.size !== 0 &&
      message.author !== message.mentions.members.first()?.user
    ) {
      const dicksize = randomDickSize();
      const enemyDicksize = randomDickSize();
      let resultLastLine: string;

      if (dicksize !== enemyDicksize) {
        resultLastLine = `Winner: ${dicksize > enemyDicksize ? message.author : message.mentions.members.first()}`;
      } else {
        resultLastLine = `It's a draw!`;
      }

      if (dicksize + enemyDicksize > 1900) {
        return {
          content:
            `This battle of the dongs is too much to just say as is, so here's the brief:\n` +
            `${message.author}: ${dicksize}cm\n` +
            `${message.mentions.members.first()}: ${enemyDicksize}cm` +
            `diff: ${Math.abs(dicksize - enemyDicksize)}cm` +
            `${resultLastLine}`,
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
        8${"=".repeat(dicksize)}D ${dicksize}cm ${message.author}
        8${"=".repeat(enemyDicksize)}D ${enemyDicksize}cm ${message.mentions.members.first()}
        diff: ${Math.abs(dicksize - enemyDicksize)}cm
        ${resultLastLine}
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
});
