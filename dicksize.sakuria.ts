import { randomDickSize } from "../../logic/logic.sakuria";
import { defineCommand } from "../../types";
import { Readable } from "stream";
import SakuriaEmbed from "src/sakuria/SakuriaEmbed.sakuria";

export default defineCommand({
  name: "dicksize",
  description: "Tell's you your dicksize or battle against someone else's dicksize!",
  requiresProcessing: false,
  execute: async (message) => {
    if (message.mentions.members && message.mentions.members.size !== 0) {
      const dicksize = randomDickSize();
      const enemyDicksize = randomDickSize();
      const author = message.author;
      const enemy = message.mentions.members.first();
      const authorWon = dicksize > enemyDicksize

      // 2000 not 1900 here because the maximum text in Embed is 2048
      if (dicksize > 2000 || enemyDicksize > 2000)
        return {
          embeds: [
            new SakuriaEmbed({
              title: `The legendary battle between ${author} and ${enemy}.`,
              description: "This battle of the dongs is too much to just say as is, so here's the brief:\n",
              footer: authorWon ? "GG, you are a champion! 💪" : `Even though you lost, you still might be a better shooter than ${enemy}.`,
              fields: [
                { name: `${author}'s mass`, value: `**${dicksize}cm**`, inline: true },
                { name: `${enemy}'s mass`, value: `**${enemyDicksize}cm**`, inline: true },
                { name: "Difference in mass:", value: `**${Math.abs(dicksize - enemyDicksize)}**cm`, inline: false },
                { name: "Final winner:", value: authorWon ? author : enemy }
              ]
            })
          ],
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
      else
        return {
          embeds: [
            new SakuriaEmbed({
              title: `The legendary battle between ${author} and ${enemy}.`,
              fields: [
                { name: `${author}'s mass`, value: `8${"=".repeat(dicksize)}D **${dicksize}**cm`, inline: true },
                { name: `${enemy}'s mass`, value: `8${"=".repeat(enemyDicksize)}D **${enemyDicksize}**cm`, inline: true },
                { name: "Difference in mass:", value: `**${Math.abs(dicksize - enemyDicksize)}**cm`, inline: false },
                { name: "Final winner:", value: authorWon ? author : enemy }
              ]
            })
          ]
        };
    } else {
      const dicksize = randomDickSize();
      const response = `8${"=".repeat(dicksize)}D ${dicksize}cm`;

      if (response.length > 2000)
        return {
          embeds: [
            new SakuriaEmbed({
              title: "Your mass",
              description: "My goodness that's some schlong",
            })
          ],
          files: [{ name: "magnum.txt", attachment: Readable.from(response) }],
        };
      else return {
        embeds: [
          new SakuriaEmbed({
            title: "Your mass",
            description: response,
            thumbnail: message.author.avatarURL({
              dynamic: true,
              format: "png",
              size: 128,
            }) || ""
          })
        ]
      };
    }
  },
});
