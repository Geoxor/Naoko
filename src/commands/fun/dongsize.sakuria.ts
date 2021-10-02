import { Readable } from "stream";
import { Collection, CommandInteraction, User } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { defaultImageOptions, randomDongSize } from "../../logic/logic.sakuria";
import { CommandType, defineCommand } from "../../types";
import SakuriaEmbed, { createInlineBlankFields } from "../../sakuria/SakuriaEmbed.sakuria";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("dongsize")
    .setDescription("Dong fight or show your dong size")
    .addStringOption((option) =>
      option.setName("mentions").setDescription("people to fight with").setRequired(false)
    ),
  type: CommandType.FUN,
  execute: (interaction) => {
    const mentions = interaction.options.getString("mentions", false);

    if (!mentions) return singleUserHandler(interaction);
    else if (interaction.guild) {
      let winner = interaction.user;
      let winnerDongSize = randomDongSize();
      const allDongs = new Collection<User, number>();

      interaction.options.resolved.users.forEach((user) => {
        const dongSize = randomDongSize();

        if (dongSize > winnerDongSize) {
          winner = user;
          winnerDongSize = dongSize;
        }

        allDongs.set(user, dongSize);
      });

      if (allDongs.size < 2) return singleUserHandler(interaction);

      const spacer = createInlineBlankFields(allDongs.size % 3);
      const embedTemplate = new SakuriaEmbed({
        title: "The legendary battle of dongs",
        thumbnail: winner.displayAvatarURL(defaultImageOptions),
      });


      // 2000 not 1900 here because the maximum text count in Embed is 2048
      if (winnerDongSize > 2000) {
        return {
          embeds: [
            embedTemplate
              .setDescription("This battle of the dongs is too much to just say as is, so here's the brief:\n")
              .setFields([
                ...allDongs.map(formatUserDongSize(winnerDongSize, false)).map(toFieldData),
                ...spacer,
              ]),
          ],
          files: [
            {
              name: "battle.txt",
              attachment: Readable.from(
                allDongs
                  .map((dongSize: number, user: User) => `${user?.tag || "?"}'s dong: 8${"=".repeat(dongSize)}D`)
                  .join("\n")
              ),
            },
          ],
        };
      } else {
        return {
          embeds: [
            embedTemplate.setFields([
              ...allDongs.map(formatUserDongSize(winnerDongSize, true)).map(toFieldData),
              ...spacer,
            ]),
          ],
        };
      }
    }
  },
});

function toFieldData([name, value]: string[]): { name: string; value: string; inline: boolean } {
  return { name, value, inline: true };
}

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

function formatUserDongSize(largestDongSize: number, showDong: boolean) {
  return (dongSize: number, user: User) => [
    `${dongSize >= largestDongSize ? "(Winner) " : ""}${user?.tag || "?"}`,
    `${showDong ? `Dong:8${"=".repeat(dongSize)}D\n` : ""}Dong size: ${dongSize.toString()}cm`,
  ];
}
