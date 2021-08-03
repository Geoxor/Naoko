import Discord, { MessageOptions } from "discord.js";
import { getBufferFromUrl, getLastAttachmentInChannel, invertImage } from "../logic/logic.sakuria";
import { IMessage } from "../types";

export default {
  name: "invert",
  description: "Invert's a url, an attachemnt or the last image in the channel",
  requiresProcessing: true,
  execute: async (message: IMessage): Promise<MessageOptions | string> => {
    const attachedImage = message.attachments.first()?.attachment;
    const targetImage = await getBufferFromUrl(message.args[0]) || attachedImage || await getLastAttachmentInChannel(message);

    if (!targetImage) return "You didn't provide an image and/or the last message doesn't contain an image";

    const invertedImageBuffer = await invertImage(targetImage as Buffer);
    const attachment = new Discord.MessageAttachment(invertedImageBuffer);

    return { files: [attachment] };
  },
};
