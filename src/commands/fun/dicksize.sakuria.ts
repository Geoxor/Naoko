import { Readable } from "stream";
import { Collection, CommandInteraction, GuildMemberManager, Snowflake } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { defaultImageOptions, getAvatarURLFromID, randomDickSize } from "../../logic/logic.sakuria";
import { defineCommand } from "../../types";
import SakuriaEmbed, { createInlineBlankField } from "../../sakuria/SakuriaEmbed.sakuria";

const USER_ID_REGEX = /<@!?(\d{18})>/g;

const toFieldData = function ([name, value]: string[]): { name: string; value: string; inline: true } {
  return { name, value, inline: true };
};

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("dicksize")
    .setDescription("Dong fight or show your dong size")
    .addStringOption((option) =>
      option.setName("mentions").setDescription("people to fight with").setRequired(false)
    ),
  execute: (interaction) => {
    const mentions = interaction.options.getString("mentions", false);

    if (!mentions) return singleUserHandler(interaction);
    else if (interaction.guild) {
      const regexResult = mentions.split(USER_ID_REGEX).filter((mention) => !!mention);
      const allDicks = new Collection<string, number>();
      const memberManager = interaction.guild.members;
      const authorDickSize = randomDickSize();

      allDicks.set(interaction.user.id, authorDickSize);

      let winnerID = interaction.user.id;
      let largestDickSize = authorDickSize;
      // starts at 1 because 0 is the input
      let i = 1;
      while (regexResult[i]) {
        if (!allDicks.has(regexResult[i])) {
          const dickSize = randomDickSize();

          if (dickSize > largestDickSize) {
            winnerID = regexResult[i];
            largestDickSize = dickSize;
          }
          allDicks.set(regexResult[i], dickSize);
        }
        i++;
      }

      const spacer = createInlineBlankField(allDicks.size % 3);
      const embedTemplate = new SakuriaEmbed({
        title: "The legendary battle of dongs",
        thumbnail: getAvatarURLFromID(winnerID, interaction),
      });

      if (allDicks.size < 2) return singleUserHandler(interaction);

      // 2000 not 1900 here because the maximum text in Embed is 2048
      if (largestDickSize > 2000) {
        return {
          embeds: [
            embedTemplate
              .setDescription("This battle of the dongs is too much to just say as is, so here's the brief:\n")
              .setFields([
                ...allDicks.map(formatUserDickSize(largestDickSize, false, memberManager)).map(toFieldData),
                ...spacer,
              ]),
          ],
          files: [
            {
              name: "battle.txt",
              attachment: Readable.from(
                allDicks
                  .map(
                    (dickSize: number, user: Snowflake) =>
                      `${memberManager.cache.get(user)?.user?.tag || "?"}'s dong: 8${"=".repeat(dickSize)}D`
                  )
                  .join("\n")
              ),
            },
          ],
        };
      } else {
        return {
          embeds: [
            embedTemplate.setFields([
              ...allDicks.map(formatUserDickSize(largestDickSize, true, memberManager)).map(toFieldData),
              ...spacer,
            ]),
          ],
        };
      }
    }
  },
});

function singleUserHandler(interaction: CommandInteraction) {
  const dickSize = randomDickSize();
  const embedTemplate = new SakuriaEmbed({
    title: "Your dong info",
    thumbnail: interaction.user.displayAvatarURL(defaultImageOptions),
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
}

function formatUserDickSize(largestDickSize: number, showDick: boolean, memberManager: GuildMemberManager) {
  return (dickSize: number, userID: string) => [
    `${dickSize >= largestDickSize ? "(Winner) " : ""}${memberManager.cache.get(userID)?.user?.tag || "?"}`,
    `${showDick ? `Dong:8${"=".repeat(dickSize)}D\n` : ""}Dong size: ${dickSize.toString()}cm`,
  ];
}
