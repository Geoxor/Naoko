import { Readable } from "stream";
import { Collection, CommandInteraction, GuildMemberManager, Snowflake } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { defaultImageOptions, getAvatarURLFromID, randomDongSize } from "../../logic/logic.sakuria";
import { defineCommand } from "../../types";
import SakuriaEmbed, { createInlineBlankField } from "../../sakuria/SakuriaEmbed.sakuria";

const USER_ID_REGEX = /<@!?(\d{18})>/g;

function toFieldData([name, value]: string[]): { name: string; value: string; inline: boolean } {
  return { name, value, inline: true };
};

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("dongsize")
    .setDescription("Dong fight or show your dong size")
    .addStringOption((option) =>
      option.setName("mentions").setDescription("people to fight with").setRequired(false)
    ),
  execute: (interaction) => {
    const mentions = interaction.options.getString("mentions", false);

    if (!mentions) return singleUserHandler(interaction);
    else if (interaction.guild) {
      const regexResult = mentions.split(USER_ID_REGEX).filter((mention) => !!mention);
      const allDongs = new Collection<string, number>();
      const memberManager = interaction.guild.members;
      const authorDongSize = randomDongSize();

      allDongs.set(interaction.user.id, authorDongSize);

      let winnerID = interaction.user.id;
      let largestDongSize = authorDongSize;
      // starts at 1 because 0 is the input
      let i = 1;
      while (regexResult[i]) {
        if (!allDongs.has(regexResult[i])) {
          const dongSize = randomDongSize();

          if (dongSize > largestDongSize) {
            winnerID = regexResult[i];
            largestDongSize = dongSize;
          }
          allDongs.set(regexResult[i], dongSize);
        }
        i++;
      }

      const spacer = createInlineBlankField(allDongs.size % 3);
      const embedTemplate = new SakuriaEmbed({
        title: "The legendary battle of dongs",
        thumbnail: getAvatarURLFromID(winnerID, interaction),
      });

      if (allDongs.size < 2) return singleUserHandler(interaction);

      // 2000 not 1900 here because the maximum text in Embed is 2048
      if (largestDongSize > 2000) {
        return {
          embeds: [
            embedTemplate
              .setDescription("This battle of the dongs is too much to just say as is, so here's the brief:\n")
              .setFields([
                ...allDongs.map(formatUserDongSize(largestDongSize, false, memberManager)).map(toFieldData),
                ...spacer,
              ]),
          ],
          files: [
            {
              name: "battle.txt",
              attachment: Readable.from(
                allDongs
                  .map(
                    (dongSize: number, user: Snowflake) =>
                      `${memberManager.cache.get(user)?.user?.tag || "?"}'s dong: 8${"=".repeat(dongSize)}D`
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
              ...allDongs.map(formatUserDongSize(largestDongSize, true, memberManager)).map(toFieldData),
              ...spacer,
            ]),
          ],
        };
      }
    }
  },
});

function singleUserHandler(interaction: CommandInteraction) {
  const dongSize = randomDongSize();
  const embedTemplate = new SakuriaEmbed({
    title: "Your dong info",
    thumbnail: interaction.user.displayAvatarURL(defaultImageOptions),
    fields: [{ name: "Total length:", value: `**${dongSize}**cm` }],
  });

  if (dongSize > 2000) {
    return {
      embeds: [embedTemplate.setDescription("My goodness that's some schlong")],
      files: [{ name: "magnum.txt", attachment: Readable.from(`8${"=".repeat(dongSize)}D`) }],
    };
  } else {
    return { embeds: [embedTemplate.addField("Your dong:", `8${"=".repeat(dongSize)}D`)] };
  }
}

function formatUserDongSize(largestDongSize: number, showDong: boolean, memberManager: GuildMemberManager) {
  return (dongSize: number, userID: string) => [
    `${dongSize >= largestDongSize ? "(Winner) " : ""}${memberManager.cache.get(userID)?.user?.tag || "?"}`,
    `${showDong ? `Dong:8${"=".repeat(dongSize)}D\n` : ""}Dong size: ${dongSize.toString()}cm`,
  ];
}
