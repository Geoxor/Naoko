import { defineCommand, IMessage } from "../../types";
import Discord from "discord.js";
import { getBufferFromUrl, getImageURLFromMessage } from "../../logic/logic.sakuria";
import { transform } from "../../logic/imageProcessors.sakuria";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";

export default defineCommand({
  name: "transform",
  description: "Transform an image with a pipeline",
  requiresProcessing: true,
  execute: async (message) => {
    const imageURL = await getImageURLFromMessage(message);
    const targetBuffer = await getBufferFromUrl(imageURL);
    const pipeline = message.args;
    const resultbuffer = await transform(pipeline, targetBuffer);
    const mimetype = await fileType(resultbuffer);
    const attachment = new Discord.MessageAttachment(resultbuffer, `shit.${mimetype.ext}`);
    return { files: [attachment] };
  },
});
