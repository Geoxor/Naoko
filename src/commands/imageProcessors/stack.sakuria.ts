import { defineCommand } from "../../types";
import Discord from "discord.js";
import { parseBufferFromMessage, preProcessBuffer } from "../../logic/logic.sakuria";
import { stack } from "../../logic/imageProcessors.sakuria";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";

// TODO: Refactor this to the main image processors
// so we can easily override the frames for diff
// processors blah blah fuck your mom
const stacks: {
  [key: string]: number;
} = {
  'wasted': 90,
}

export default defineCommand({
  name: "stack",
  description: "Stack an image processor and make a gif out of it",
  requiresProcessing: true,
  execute: async (message) => {
    const processorFunctionName = message.args[0];
    if (!processorFunctionName) return "please enter a name of an image processor function";
    const buffer = await parseBufferFromMessage(message);
    const preProccessed = await preProcessBuffer(buffer);
    const resultbuffer = await stack(processorFunctionName, preProccessed, stacks[processorFunctionName]);
    const mimetype = await fileType(resultbuffer);
    const attachment = new Discord.MessageAttachment(resultbuffer, `shit.${mimetype.ext}`);
    return { files: [attachment] };
  },
});
