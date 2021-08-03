import Discord, { MessageOptions } from "discord.js";
import { invertImage } from "../logic/logic.sakuria";
import { IMessage } from "../types";

export default {
  name: "invert",
  description: "Invert's the current or last image in the chat",
  requiresProcessing: true,
  execute: async (message: IMessage): Promise<MessageOptions | string> => {
    const attachedImage = message.attachments.first()?.attachment;
    const targetImage = 
      attachedImage 
        ? attachedImage 
        : message.channel.lastMessage?.attachments.first()?.attachment;

    if (!targetImage) return "You didn't provide an image and/or the last message doesn't contain an image"

    const invertedImageBuffer = await invertImage(targetImage as Buffer);

    const attachment = new Discord.MessageAttachment(invertedImageBuffer);

    return {files: [ attachment ]};
  },
};
