import axios from "axios";
import Discord, { MessageOptions } from "discord.js";
import { invertImage } from "../logic/logic.sakuria";
import { IMessage } from "../types";

async function getBufferFromMessageUrl(message: IMessage) {
  // If they are giving us an image url
  const imageUrl = message.args[0];
  if (imageUrl) {
    const response = await axios({method: 'GET', url: imageUrl, responseType: "arraybuffer"});
    return Buffer.from(response.data);
  } 
}

// Last attachment in the current channel
async function getLastAttachmentInChannel(message: IMessage) {
  const messages = await message.channel.messages.fetch()
  const lastMessage = messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => m.attachments.size > 0).first();
  return lastMessage?.attachments.first()?.attachment;
}

export default {
  name: "invert",
  description: "Invert's the current or last image in the chat",
  requiresProcessing: true,
  execute: async (message: IMessage): Promise<MessageOptions | string> => {
    const attachedImage = message.attachments.first()?.attachment;
    const targetImage = await getBufferFromMessageUrl(message) || attachedImage || await getLastAttachmentInChannel(message);

    if (!targetImage) return "You didn't provide an image and/or the last message doesn't contain an image";

    const invertedImageBuffer = await invertImage(targetImage as Buffer);
    const attachment = new Discord.MessageAttachment(invertedImageBuffer);

    return { files: [attachment] };
  },
};
