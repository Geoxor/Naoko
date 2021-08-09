import { IMessage } from "../../types";
import Discord from "discord.js";
import { createTrolley, getBufferFromUrl } from "../../logic/logic.sakuria";

export default {
  name: "trolley",
  description: "Makes a trolley out of your avatar",
  requiresProcessing: true,
  execute: async (message: IMessage): Promise<Discord.ReplyMessageOptions> => {
    if (message.mentions.users.first()) {
      const targetUserAvatar = message.mentions.users.first()!.displayAvatarURL({ format: "png", size: 32 });
      const avatar = await getBufferFromUrl(targetUserAvatar);
      return { files: [await createTrolley(avatar)] };
    }

    const avatar = await getBufferFromUrl(message.author.displayAvatarURL({ format: "png", size: 32 }));
    return { files: [await createTrolley(avatar)] };
  },
};
