import { singleton } from "@triptyk/tsyringe";
import plugin from "../../decorators/plugin";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../types";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import AnimeService from "../../service/AnimeService";
import { EmbedBuilder } from "discord.js";
import AbstractCommand, { CommandData } from "../AbstractCommand";

@singleton()
class AnimeSearch extends AbstractCommand {
  constructor(
    private animeService: AnimeService,
  ) {
    super();
  }

  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const arg = payload.get('args').join(" ");
    if (!arg) {
      return "What are you looking for?";
    }

    let animeMeta;
    try {
      animeMeta = await this.animeService.anilistSearch(arg);
    } catch (error: any) {
      return error.response?.data?.error || error.response?.statusText || "Couldn't find anime..";
    }

    // prepare an embed to send to the user
    const embed = new EmbedBuilder()
      .setColor("#FF90E0")
      .setThumbnail(animeMeta.coverImage.large)
      .setDescription(animeMeta.description.replace(/<br>/g, ""));
    if (animeMeta.bannerImage) embed.setImage(animeMeta.bannerImage);

    let title = `${animeMeta.title.romaji}\n${animeMeta.title.native}`;
    if (animeMeta.externalLinks[0]?.url) {
      title += "\n" + animeMeta.externalLinks[0]?.url;
    }
    embed.setTitle(title);

    return embed;
  }

  get commandData(): CommandData {
    return {
      name: "anime",
      category: "FUN",
      usage: "<search_string>",
      description: "Looks up an anime on Anilist",
      requiresProcessing: true,
    }
  }
}

@singleton()
class Trace extends AbstractCommand {
  constructor(
    private animeService: AnimeService,
  ) {
    super();
  }

  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const args = payload.get('args');
    const message = payload.get('message');

    // Check if they sent shit
    const url = args[0] || message.attachments.first()?.url;
    if (!url) {
      return "Please attach an image or a url in your command";
    }

    // Get the anime
    try {
      const anime = await this.animeService.traceAnime(url);
      const animeMeta = await this.animeService.anilistQuery(anime.anilist);

      // prepare an embed to send to the user
      return new EmbedBuilder()
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
    } catch (error: any) {
      return error.response?.data?.error || error.response?.statusText || "Couldn't find anime..";
    }
  }

  get commandData(): CommandData {
    return {
      name: "trace",
      category: "FUN",
      usage: "<image_url>",
      description: "Attempts to find what anime a screenshot or GIF is from",
      requiresProcessing: true,
    };
  }
}

@plugin()
class Anime extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: '@geoxor/anime',
      version: '1.0.0',
      commands: [AnimeSearch, Trace],
    }
  }
}
