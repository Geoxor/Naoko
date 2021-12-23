import Discord from "discord.js";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";
import { transform } from "../../logic/imageProcessors.shaii";
import { parseBufferFromMessage } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "transform",
  aliases: ["tf"],
  usage: "transform <...processor_names> <image | url | reply | user_id>",
  category: "IMAGE_PROCESSORS",
  description: "Transform an image with a pipeline",
  requiresProcessing: true,
  execute: async (message) => {
    const pipeline = message.args;
    if (pipeline.length > 10) return "Pipeline can't be longer than 10 iterators";
    const buffer = await parseBufferFromMessage(message);
    const resultbuffer = await transform(pipeline, buffer);
    const mimetype = await fileType(resultbuffer);
    const attachment = new Discord.MessageAttachment(resultbuffer, `shit.${mimetype.ext}`);
    return { files: [attachment] };
  },
});
