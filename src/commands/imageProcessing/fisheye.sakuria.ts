import { IMessage } from "../../types";
import Discord from "discord.js";
import { getBufferFromUrl, getImageURLFromMessage } from "../../logic/logic.sakuria";
import { fisheye } from "../../logic/imageProcessors.sakuria";

export default {
  name: "fisheye",
  description: "Fisheye an attachment, url, emoji or avatar",
  requiresProcessing: true,
  execute: async (message: IMessage): Promise<string | Discord.ReplyMessageOptions> => {
    const imageURL = await getImageURLFromMessage(message);
    const targetBuffer = await getBufferFromUrl(imageURL);
    return { files: [await fisheye(targetBuffer)] };
  },
};
