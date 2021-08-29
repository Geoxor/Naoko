import { randomDickSize } from "../../logic/logic.sakuria";
import { defineCommand } from "../../types";
import { Readable } from "stream";
import { User } from "discord.js";
import SakuriaEmbed, { createErrorEmbed, createInlineBlankField } from "src/sakuria/SakuriaEmbed.sakuria";

export default defineCommand({
  name: "dicksize",
  description: "Tell's you your dicksize or battle against someone else's dicksize!",
  requiresProcessing: false,
  execute: async (message) => {
    const mentionedUsers = message.mentions.users;

    if (mentionedUsers.size) {
      if (mentionedUsers.size > 20) {
        return {
          embeds: [createErrorEmbed("For you guys' healthiness, only 20 people can join the fight at once(including you).")]
        };
      }

      const authorDickSize = randomDickSize();
      const allDicks: [User, number][] = [[message.author, authorDickSize]];
      const toFieldData = function([name, value]: string[]): { name: string, value: string, inline: true } {
        return { name, value, inline: true }
      };
      // actually only used for embed image because there might be multiple
      let winner: User = message.author;
      let largestDickSize = authorDickSize;

      mentionedUsers.forEach((user: User) => {
        const dickSize = 3000;

        if (dickSize > largestDickSize) {
          winner = user;
          largestDickSize = dickSize;
        }
        allDicks.push([user, dickSize]);
      });

      const dickAmountMod3 = allDicks.length % 3;
      const embedTemplate = new SakuriaEmbed({
        title: "The legendary battle of dongs",
        thumbnail: winner.displayAvatarURL({
          dynamic: true,
          format: "png",
          size: 128,
        })
      });

      // 2000 not 1900 here because the maximum text in Embed is 2048
      if (largestDickSize > 2000) {
        return {
          embeds: [
            embedTemplate
              .setDescription("This battle of the dongs is too much to just say as is, so here's the brief:\n")
              .setFields([
                ...allDicks
                  .map(([user, dickSize]) =>
                    [
                      `${dickSize >= largestDickSize ? "(Winner) " : ""}${user.tag}`,
                      `Dong size: ${dickSize.toString()}`
                    ]
                  )
                  .map(toFieldData),
                ...(dickAmountMod3 ? createInlineBlankField(dickAmountMod3) : [])
              ])
          ],
          files: [
            {
              name: "battle.txt",
              attachment: Readable.from(
                allDicks.reduce((acc, [user, dickSize]) =>
                  `${user.tag}'s dong: 8${"=".repeat(dickSize)}D`, ""
                )
              ),
            },
          ]
        }
      } else {
        return {
          embeds: [
            embedTemplate.setFields([
              ...allDicks
                .map(([user, dickSize]) =>
                  [
                    `${dickSize >= largestDickSize ? "(Winner) " : ""}${user.tag}`,
                    `Dong:8${"=".repeat(dickSize)}D\nDong size: ${dickSize.toString()}`
                  ]
                )
                .map(toFieldData),
              ...(dickAmountMod3 ? createInlineBlankField(dickAmountMod3) : [])
            ])
          ]
        }
      }
    } else {
      const dickSize = randomDickSize();

      if (dickSize > 2000) {
        return {
          embeds: [
            new SakuriaEmbed({
              title: "Your mass info",
              description: "My goodness that's some schlong",
              fields: [{ name: "Total length:", value: dickSize.toString() }]
            })
          ],
          files: [{name: "magnum.txt", attachment: Readable.from(`8${"=".repeat(dickSize)}D`)}],
        };
      } else {
        return {
          embeds: [
            new SakuriaEmbed({
              title: "Your dong info",
              thumbnail: message.author.displayAvatarURL({
                dynamic: true,
                format: "png",
                size: 128,
              }) || "",
              fields: [
                { name: "Your mass:", value: `8${"=".repeat(dickSize)}D` },
                { name: "Total length:", value: dickSize.toString() }
              ]
            })
          ]
        };
      }
    }
  },
});
