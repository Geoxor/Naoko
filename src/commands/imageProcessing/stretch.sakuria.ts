import { IMessage } from "../../types";
import Discord from "discord.js";
import { getBufferFromUrl, getImageURLFromMessage, stretchImage } from "../../logic/logic.sakuria";

export default {
  name: "stretch",
  description: "Stretch an attachment, url, emoji or avatar",
  requiresProcessing: true,
  execute: async (message: IMessage): Promise<string | Discord.ReplyMessageOptions> => {
    const imageURL = await getImageURLFromMessage(message);
    const targetBuffer = await getBufferFromUrl(imageURL);
    return { files: [await stretchImage(targetBuffer)] };
  },
};
