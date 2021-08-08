import sakuria from "../../sakuria/Sakuria.sakuria";
import { IMessage } from "../../types";
export default {
  name: "avatar",
  description: "Get the avatar of a user or yours",
  requiresProcessing: false,
  execute: (message: IMessage): string => {
    const otherUser = message.mentions.users.first();
    return (otherUser ? otherUser.avatarURL() : message.author.avatarURL()) || message.author.defaultAvatarURL;
  },
};
