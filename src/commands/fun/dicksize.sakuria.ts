import { randomDickSize } from "src/logic/logic.sakuria";
import { defineCommand } from "src/types";
import { Readable } from "stream";
import { ImageURLOptions, GuildMemberManager, Snowflake } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import SakuriaEmbed, { createErrorEmbed, createInlineBlankField } from "src/sakuria/SakuriaEmbed.sakuria";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("dicksize")
    .setDescription("Dong fight or show your dong size")
    .addStringOption((option) =>
      option.setName("mentions").setDescription("people to fight with").setRequired(false)
    ),
  execute: (interaction) => {
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
        fields: [{ name: "Total length:", value: `**${dickSize}**cm` }],
      });

      if (dickSize > 2000) {
        return {
          embeds: [embedTemplate.setDescription("My goodness that's some schlong")],
          files: [{ name: "magnum.txt", attachment: Readable.from(`8${"=".repeat(dickSize)}D`) }],
        };
      } else {
        return { embeds: [embedTemplate.addField("Your dong:", `8${"=".repeat(dickSize)}D`)] };
      }
    } else {
      const mentionedUsers = content.match(/<@!?(\d{18})>/g)?.map((str: string) => str.match(/\d{18}/g)?.[0]) || null;

      if (!mentionedUsers) return { embeds: [createErrorEmbed("You must provide mentions!")] };
      if (mentionedUsers.length > 20) return {
        embeds: [createErrorEmbed("For you guys' healthiness, only 20 people can join the fight at once(including you).")]
      }

      const memberManager = interaction.guild.members;
      const authorDickSize = randomDickSize();
      const allDicks: [Snowflake, number][] = [[interaction.user.id, authorDickSize]];
      const toFieldData = function ([name, value]: string[]): { name: string; value: string; inline: true } {
        return { name, value, inline: true };
      };
      // actually only used for embed image because there might be multiple
      let winnerID: Snowflake = interaction.user.id;
      let largestDickSize = authorDickSize;

      mentionedUsers.forEach((userID: string | undefined) => {
        if (!userID) return;

        const dickSize = randomDickSize();

        if (dickSize > largestDickSize) {
          winnerID = userID;
          largestDickSize = dickSize;
        }
        allDicks.push([userID, dickSize]);
      });

      const dickAmountMod3 = allDicks.length % 3;
      const spacer = dickAmountMod3 ? createInlineBlankField(dickAmountMod3) : [];
      const embedTemplate = new SakuriaEmbed({
        title: "The legendary battle of dongs",
        thumbnail: memberManager.resolve(winnerID)?.user?.displayAvatarURL(displayAvatarSetting) || "",
      });

      // 2000 not 1900 here because the maximum text in Embed is 2048
      if (largestDickSize > 2000) {
        return {
          embeds: [
            embedTemplate
              .setDescription("This battle of the dongs is too much to just say as is, so here's the brief:\n")
              .setFields([
                ...allDicks
                  .map(formatUserDickSize(largestDickSize, false, memberManager))
                  .map(toFieldData),
                ...spacer,
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
          ],
        };
      } else {
        return {
          embeds: [
            embedTemplate.setFields([
              ...allDicks
                .map(formatUserDickSize(largestDickSize, true, memberManager))
                .map(toFieldData),
              ...spacer,
            ])
          ],
        };
      }
    }
  },
});

function formatUserDickSize(largestDickSize: number, showDick: boolean, memberManager: GuildMemberManager) {
  return ([userID, dickSize]: [string, number]) => [
    `${dickSize >= largestDickSize ? "(Winner) " : ""}${memberManager.resolve(userID)?.user?.tag || "?"}`,
    `${showDick ? `Dong:8${"=".repeat(dickSize)}D\n` : ""}Dong size: ${dickSize.toString()}`,
  ];
}
