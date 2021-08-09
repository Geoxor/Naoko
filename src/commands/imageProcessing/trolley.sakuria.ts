import { IMessage } from "../../types";
import Discord from "discord.js";
import { createTrolley, getBufferFromUrl, getImageURLFromMessage } from "../../logic/logic.sakuria";

export default {
  name: "trolley",
  description: "Makes a trolley out of an attachment, url or avatar",
  requiresProcessing: true,
  execute: async (message: IMessage): Promise<string | Discord.ReplyMessageOptions> => {
    const imageURL = await getImageURLFromMessage(message);
    const targetBuffer = await getBufferFromUrl(imageURL);
    return { files: [await createTrolley(targetBuffer)] };
  },
};
