import { IMessage } from "../../types";
import Discord from "discord.js";
import { getBufferFromUrl, getImageURLFromMessage } from "../../logic/logic.sakuria";
import { transform } from "../../logic/imageProcessors.sakuria";

export default {
  name: "transform",
  description: "Transform an image with a pipeline",
  requiresProcessing: true,
  execute: async (message: IMessage): Promise<Discord.ReplyMessageOptions> => {
    const imageURL = await getImageURLFromMessage(message);
    const targetBuffer = await getBufferFromUrl(imageURL);
    const pipeline = message.args;
    return { files: [await transform(pipeline, targetBuffer)] };
  },
};