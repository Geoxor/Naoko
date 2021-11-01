import { defineCommand, IMessage } from "../../types";
import Discord from "discord.js";
import { anilistQuery, traceAnime } from "../../logic/logic.sakuria";

export default defineCommand({
  name: "trace",
  description: "Attempts to find what anime a screenshot or GIF is from",
  requiresProcessing: true,
  execute: async (message) => {
    // Check if they sent shit
    const url = message.args[0] || message.attachments.first()?.url;

    // Reply if not
    if (!url) return "Please attach an image or a url in your command";

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
