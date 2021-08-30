import { randomDickSize } from "../../logic/logic.sakuria";
import { defineCommand } from "../../types";
import { Readable } from "stream";
import { ImageURLOptions, User } from "discord.js";
import SakuriaEmbed, { createErrorEmbed, createInlineBlankField } from "src/sakuria/SakuriaEmbed.sakuria";

export default defineCommand({
  name: "dicksize",
  description: "Tell's you your dicksize or battle against someone else's dicksize!",
  requiresProcessing: false,
  execute: async (message) => {
    const mentionedUsers = message.mentions.users;
    const displayAvatarSetting: ImageURLOptions = {
      dynamic: true,
      format: "png",
      size: 128,
    };

    if (mentionedUsers.size) {
      if (mentionedUsers.size > 20) {
        await message.reply({
          embeds: [createErrorEmbed("For you guys' healthiness, only 20 people can join the fight at once(including you).")]
        });
        return;
      }
  
      const authorDickSize = randomDickSize();
      const allDicks: [User, number][] = [[message.author, authorDickSize]];
      const toFieldData = function([name, value]: string[]): { name: string, value: string, inline: true } {
        return { name, value, inline: true }
      };
      let winner = message.author;
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
      const spacer = dickAmountMod3 ? createInlineBlankField(dickAmountMod3) : []
      const embedTemplate = new SakuriaEmbed({
        title: "The legendary battle of dongs",
        thumbnail: winner.displayAvatarURL(displayAvatarSetting)
      });

      // 2000 not 1900 here because the maximum text in Embed is 2048
      if (largestDickSize > 2000) {
        return {
          embeds: [
            embedTemplate
              .setDescription("This battle of the dongs is too much to just say as is, so here's the brief:\n")
              .setFields([
                ...allDicks
                  .map(formatUserDickSize(largestDickSize, false))
                  .map(toFieldData),
                ...spacer
              ])
          ],
          files: [
            {
              name: "battle.txt",
              attachment: Readable.from(
                allDicks
                  .map(([user, dickSize]) => `${user.tag}'s dong: 8${"=".repeat(dickSize)}D`)
                  .join("\n")
              ),
            },
          ]
        }
      } else {
        return {
          embeds: [
            embedTemplate.setFields([
              ...allDicks
                .map(formatUserDickSize(largestDickSize, true))
                .map(toFieldData),
              ...spacer
            ])
          ]
        }
      }
    } else {
      const dickSize = randomDickSize();
      const embedTemplate = new SakuriaEmbed({
        title: "Your dong info",
        thumbnail: message.author.displayAvatarURL(displayAvatarSetting),
        fields: [{ name: "Total length:", value: `**${dickSize}**cm` }]
      });

      if (dickSize > 2000) {
        message.reply({
          embeds: [embedTemplate.setDescription("My goodness that's some schlong")],
          files: [{name: "magnum.txt", attachment: Readable.from(`8${"=".repeat(dickSize)}D`)}],
        });
      } else {
        message.reply({ embeds: [embedTemplate.addField("Your dong:", `8${"=".repeat(dickSize)}D`)] });
      }
    }
  },
});

function formatUserDickSize(largestDickSize: number, showDick: boolean) {
  return ([userTag, dickSize]: [string, number]) => [
    `${dickSize >= largestDickSize ? "(Winner) " : ""}${userTag}`,
    `${showDick ? `Dong:8${"=".repeat(dickSize)}D\n` : ""}Dong size: ${dickSize.toString()}`
  ];
}