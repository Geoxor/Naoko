import { randomDickSize } from "../../logic/logic.sakuria";
import { defineCommand } from "../../types";
import { Readable } from "stream";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("dicksize")
    .setDescription("Tell's you your dicksize or battle against someone else's dicksize")
    .addUserOption((option) => option
      .setName("user")
      .setDescription("the user to battle against")
      .setRequired(false)
    ),
  requiresProcessing: false,
  execute: async (interaction) => {
    const otherUser = interaction.options.getUser("user");
    if (otherUser) {
      const dicksize = randomDickSize();
      const enemyDicksize = randomDickSize();

      if (dicksize + enemyDicksize > 1900) {
        return {
          content:
            `This battle of the dongs is too much to just say as is, so here's the brief:\n` +
            `${interaction.user}: ${dicksize}cm\n` +
            `${otherUser}: ${enemyDicksize}cm` +
            `diff: ${Math.abs(dicksize - enemyDicksize)}cm` +
            `winner: ${dicksize > enemyDicksize ? interaction.user : otherUser}`,
          files: [
            {
              name: "battle.txt",
              attachment: Readable.from(
                `${interaction.user.username}'s long dong:\n 8${"=".repeat(dicksize)}D\n` +
                  `${otherUser.username}'s long dong:\n 8${"=".repeat(enemyDicksize)}D\n`
              ),
            },
          ],
        };
      } else
        return `
        8${"=".repeat(dicksize)}D ${dicksize}cm ${interaction.user}
        8${"=".repeat(enemyDicksize)}D ${enemyDicksize}cm ${otherUser}
        diff: ${Math.abs(dicksize - enemyDicksize)}cm
        winner: ${dicksize > enemyDicksize ? interaction.user : otherUser}
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
