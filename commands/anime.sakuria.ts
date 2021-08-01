import { IMessage } from "../types";
import Discord from "discord.js";
import { anilistSearch } from "../logic/logic.sakuria";

export const command = {
  name: "anime",
  requiresProcessing: true,
  execute: async (message: IMessage): Promise<string | Discord.ReplyMessageOptions> => {
    // Get the anime
    try {
      const animeMeta = (await anilistSearch(message.args.join(" ")));
      // prepare an embed to send to the user
      const embed = new Discord.MessageEmbed()
        .setColor("#FF90E0")
        .setTitle(`${animeMeta.title.romaji}\n${animeMeta.title.native}\n${animeMeta.externalLinks[0]?.url}`)
        .setThumbnail(animeMeta.coverImage.large)
        .setDescription(animeMeta.description.replace(/<br>/g, ""))
      if(animeMeta.bannerImage) embed.setImage(animeMeta.bannerImage);
      return { embeds: [embed] };
    } catch (error) {
      return error.response?.data?.error || error.response?.statusText || "Couldn't find anime..";
    }
  },
};
