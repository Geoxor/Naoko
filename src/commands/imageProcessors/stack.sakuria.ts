import { defineCommand, IMessage } from "../../types";
import Discord from "discord.js";
import { getBufferFromUrl, getImageURLFromMessage } from "../../logic/logic.sakuria";
import { stack } from "../../logic/imageProcessors.sakuria";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";

export default defineCommand({
  name: "stack",
  description: "Stack an image processor and make a gif out of it",
  requiresProcessing: true,
  execute: async (message) => {
    const imageURL = await getImageURLFromMessage(message);
    const targetBuffer = await getBufferFromUrl(imageURL);
    const processorFunctionName = message.args[0];
    if (!processorFunctionName) return "please enter a name of an image processor function";
    const resultbuffer = await stack(processorFunctionName, targetBuffer);
    const mimetype = await fileType(resultbuffer);
    const attachment = new Discord.MessageAttachment(resultbuffer, `shit.${mimetype.ext}`);
    return { files: [attachment] };
  },
});
