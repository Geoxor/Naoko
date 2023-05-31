import Discord from "discord.js";
import { anilistQuery, traceAnime } from "../../logic/logic";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class Trace extends AbstractCommand {
  async execute(message: IMessage): Promise<CommandExecuteResponse> {
    // Check if they sent shit
    const url = message.args[0] || message.attachments.first()?.url;

    // Reply if not
    if (!url) return "Please attach an image or a url in your command";

    // Get the anime
    try {
      const anime = await traceAnime(url);
      const animeMeta = await anilistQuery(anime.anilist);

      // prepare an embed to send to the user
      const embed = new Discord.EmbedBuilder()
        .setColor("#FF90E0")
        .setTitle(`${animeMeta.title.romaji}\n${animeMeta.title.native}\n${animeMeta.externalLinks[0]?.url || ''}`)
        .setThumbnail(animeMeta.coverImage.large)
        .setDescription(animeMeta.description.replace(/<br>/g, ""))
        .addFields([
          { name: "Episode", value: anime.episode?.toString() || "Unkown", inline: true },
          { name: "Anilist", value: anime.anilist?.toString() || "Unkown", inline: true },
          { name: "Confidence", value: `${~~(anime.similarity * 100)}%` || "Unknown", inline: true },
          { name: "Timestamp", value: `${anime.from.toString()}-${anime.to.toString()}` || "Unknown", inline: true },
        ])
        .setImage(anime.image);

      return { embeds: [embed] };
    } catch (error: any) {
      return error.response?.data?.error || error.response?.statusText || "Couldn't find anime..";
    }
  }

  getCommandData(): CommandData {
    return {
      name: "trace",
      category: "FUN",
      usage: "trace <image_url>",
      description: "Attempts to find what anime a screenshot or GIF is from",
      requiresProcessing: true,
    }
  }
}
