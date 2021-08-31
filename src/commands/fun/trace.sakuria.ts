import { defineCommand, IMessage } from "../../types";
import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { anilistQuery, traceAnime } from "../../logic/network.sakuria";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("trace")
    .setDescription("Attempts to find what anime a screenshot or GIF is from")
    .addStringOption((option) =>
      option.setName("url").setDescription("The image URL to trace").setRequired(true)
    ),
  requiresProcessing: true,
  execute: async (interaction) => {
    // Check if they sent shit
    const url = interaction.options.getString("url", true);

    // Get the anime
    try {
      const anime = await traceAnime(url);
      const animeMeta = await anilistQuery(anime.anilist);

      // prepare an embed to send to the user
      const embed = new Discord.MessageEmbed()
        .setColor("#FF90E0")
        .setTitle(`${animeMeta.title.romaji}\n${animeMeta.title.native}\n${animeMeta.externalLinks[0].url}`)
        .setThumbnail(animeMeta.coverImage.large)
        .setDescription(animeMeta.description.replace(/<br>/g, ""))
        .addField("Episode", anime.episode?.toString() || "Unknown", true)
        .addField("Anilist", anime.anilist?.toString() || "Unknown", true)
        .addField("Confidence", `${~~(anime.similarity * 100)}%` || "Unknown", true)
        .addField("Timestamp", `${anime.from.toString()}-${anime.to.toString()}` || "Unknown", true)
        .setImage(anime.image);

      return { embeds: [embed] };
    } catch (error) {
      return error.response?.data?.error || error.response?.statusText || "Couldn't find anime..";
    }
  },
});
