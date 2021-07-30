import { MessageOptions } from "discord.js";
import { Readable } from "stream";
import { IMessage } from "../types";

function randomDickSize(): number {
  let x = Math.random();
  return Math.min( ~~( 1/(1-x) + 30*x ), 4_000_000);
}

export const command = {
  name: "dicksize",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<string | MessageOptions> => {
    let response: string;
    if (message.mentions.members && message.mentions.members.size !== 0) {
      const dicksize = randomDickSize();
      const enemyDicksize = randomDickSize();

      response = `
        8${"=".repeat(dicksize)}D ${dicksize}cm <@${message.author}>
        8${"=".repeat(enemyDicksize)}D ${enemyDicksize}cm <@${message.mentions.members.first()}>
        diff: ${Math.abs(dicksize - enemyDicksize)}cm
        winner: <@${dicksize > enemyDicksize ? message.author : message.mentions.members.first()}>
      `;
    }
    else {
      const dicksize = randomDickSize();
      response = `8${"=".repeat(dicksize)}D ${dicksize}cm`;
    }

    if (response.length > 2000) return {content: "My goodness that's some schlong", files: [{name: "magnum.txt", attachment: Readable.from(response)}]}
    else return response;
  },
};
