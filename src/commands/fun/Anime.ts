import Discord from "discord.js";
import { anilistSearch } from "../../logic/logic";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class Anime extends AbstractCommand {
  async execute(message: IMessage): Promise<CommandExecuteResponse> {
    let animeMeta;
    try {
      animeMeta = await anilistSearch(message.args.join(" "));
    } catch (error: any) {
      return error.response?.data?.error || error.response?.statusText || "Couldn't find anime..";
    }

    // prepare an embed to send to the user
    const embed = new Discord.EmbedBuilder()
      .setColor("#FF90E0")
      .setThumbnail(animeMeta.coverImage.large)
      .setDescription(animeMeta.description.replace(/<br>/g, ""));
    if (animeMeta.bannerImage) embed.setImage(animeMeta.bannerImage);

    let title = `${animeMeta.title.romaji}\n${animeMeta.title.native}`;
    if (animeMeta.externalLinks[0]?.url) {
      title += "\n" + animeMeta.externalLinks[0]?.url;
    }
    embed.setTitle(title);

    return { embeds: [embed] };
  }

  getCommandData(): CommandData {
    return {
      name: "anime",
      category: "FUN",
      usage: "anime <search_string>",
      description: "Looks up an anime on Anilist",
      requiresProcessing: true,
    }
  }
}
