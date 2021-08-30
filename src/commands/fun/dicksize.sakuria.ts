import { randomDickSize } from "../../logic/logic.sakuria";
import { defineCommand } from "../../types";
import { Readable } from "stream";
import { ImageURLOptions, GuildMemberManager, Snowflake } from "discord.js";
import SakuriaEmbed, { createErrorEmbed, createInlineBlankField } from "src/sakuria/SakuriaEmbed.sakuria";

export default defineCommand({
  name: "dicksize",
  description: "Tell's you your dicksize or battle against someone else's dicksize!",
  requiresProcessing: false,
  execute: async (interaction) => {
    const content = interaction.options.getString("mentions", false);
    const displayAvatarSetting: ImageURLOptions = {
      dynamic: true,
      format: "png",
      size: 128,
    };

    if (!content) {
      const dickSize = randomDickSize();
      const embedTemplate = new SakuriaEmbed({
        title: "Your dong info",
        thumbnail: interaction.user.displayAvatarURL(displayAvatarSetting),
        fields: [{ name: "Total length:", value: `**${dickSize}**cm` }]
      });

      if (dickSize > 2000) {
        await interaction.reply({
          embeds: [embedTemplate.setDescription("My goodness that's some schlong")],
          files: [{name: "magnum.txt", attachment: Readable.from(`8${"=".repeat(dickSize)}D`)}],
        });
      } else {
        await interaction.reply({ embeds: [embedTemplate.addField("Your dong:", `8${"=".repeat(dickSize)}D`)] });
      }
    } else {
      const mentionedUsers = content.match(/<@!?(\d{18})>/g)?.flatMap((str: string) => str.match(/\d{18}/g)) || null;

      if (!mentionedUsers) return await interaction.reply({ embeds: [createErrorEmbed("You must provide mentions!")] });
      if (mentionedUsers.length > 20) {
        await interaction.reply({
          embeds: [createErrorEmbed("For you guys' healthiness, only 20 people can join the fight at once(including you).")]
        });
        return;
      }

      const memberManager = interaction.guild.members;
      const authorDickSize = randomDickSize();
      const allDicks: [Snowflake, number][] = [[interaction.user.id, authorDickSize]];
      const toFieldData = function([name, value]: string[]): { name: string, value: string, inline: true } {
        return { name, value, inline: true }
      };
      // actually only used for embed image because there might be multiple
      let winnerID: Snowflake = interaction.user.id;
      let largestDickSize = authorDickSize;

      mentionedUsers
        .forEach((userID: string | null) => {
          if (!userID) return

          const dickSize = randomDickSize();

          if (dickSize > largestDickSize) {
            winnerID = userID;
            largestDickSize = dickSize;
          }
          allDicks.push([userID, dickSize]);
        });

      const dickAmountMod3 = allDicks.length % 3;
      const embedTemplate = new SakuriaEmbed({
        title: "The legendary battle of dongs",
        thumbnail: memberManager.resolve(winnerID)?.user?.displayAvatarURL(displayAvatarSetting) || ""
      });

      // 2000 not 1900 here because the maximum text in Embed is 2048
      await interaction.reply(
        largestDickSize > 2000 ? {
          embeds: [
            embedTemplate
              .setDescription("This battle of the dongs is too much to just say as is, so here's the brief:\n")
              .setFields([
                ...allDicks
                  .map(formatUserDickSize(largestDickSize, false, memberManager))
                  .map(toFieldData),
                ...(dickAmountMod3 ? createInlineBlankField(dickAmountMod3) : [])
              ])
          ],
          files: [
            {
              name: "battle.txt",
              attachment: Readable.from(
                allDicks
                  .map(([user, dickSize]) => `${memberManager.resolve(user)?.user?.tag || "?"}'s dong: 8${"=".repeat(dickSize)}D`)
                  .join("\n")
              ),
            },
          ]
        } : {
          embeds: [
            embedTemplate.setFields([
              ...allDicks
                .map(formatUserDickSize(largestDickSize, true, memberManager))
                .map(toFieldData),
              ...(dickAmountMod3 ? createInlineBlankField(dickAmountMod3) : [])
            ])
          ]
        }
      );
    }
  },
});

function formatUserDickSize(largestDickSize: number, showDick: boolean, memberManager: GuildMemberManager) {
  return ([userID, dickSize]: [string, number]) => [
    `${dickSize >= largestDickSize ? "(Winner) " : ""}${memberManager.resolve(userID)?.user?.tag || "?"}`,
    `${showDick ? `Dong:8${"=".repeat(dickSize)}D\n` : ""}Dong size: ${dickSize.toString()}`
  ];
}
