import Discord, { MessageOptions } from "discord.js";
import { getBufferFromUrl, getLastAttachmentInChannel, invertImage } from "../../logic/logic.sakuria";
import { IMessage } from "../../types";

export default {
  name: "invert",
  description: "Inverts a url, an attachment or the last image in the channel",
  requiresProcessing: true,
  execute: async (message: IMessage): Promise<MessageOptions | string> => {
    const attachedImage = message.attachments.first()?.attachment;
    const targetImage = attachedImage || (await getLastAttachmentInChannel(message)) || (await getBufferFromUrl(message.args[0]));

    if (!targetImage) return "You didn't provide an image and/or the last message doesn't contain an image";

    const invertedImageBuffer = await invertImage(targetImage as Buffer);
    const attachment = new Discord.MessageAttachment(invertedImageBuffer);

    return { files: [attachment] };
  },
};
