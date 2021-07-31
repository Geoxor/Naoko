import { IAnilistAnime, IAnime, IMessage } from "../types";
import Discord from "discord.js";
import axios from "axios";

async function traceAnime(url: string): Promise<IAnime> {
  const { data } = await axios.get(`https://api.trace.moe/search?url=${encodeURIComponent(url)}`);
  return data.result[0];
}

async function anilistQuery(animeID: number): Promise<IAnilistAnime> {
  const variables = {
    id: animeID,
  }

  const query = `query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      description
      externalLinks {
        url
      }
      coverImage {
        large
      }
      title {
        romaji
        native
      }
    }
  }`

  const {data: response} = await axios.post('https://graphql.anilist.co/', { query, variables });
  return response.data.Media
}

export const command = {
  name: "trace",
  requiresProcessing: true,
  execute: async (message: IMessage): Promise<string | Discord.ReplyMessageOptions> => {
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
        .setColor("#ffffff")
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
      return error.response.data.error;
    }
  },
};
