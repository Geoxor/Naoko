import sakuria from "../../sakuria/Sakuria.sakuria";
import { defineCommand } from "../../types";
export default defineCommand({
  name: "avatar",
  description: "Get the avatar of a user or yours",
  requiresProcessing: false,
  execute: (message) => {
    const otherUser = message.mentions.users.first();
    return (otherUser ? otherUser.avatarURL() : message.author.avatarURL()) || message.author.defaultAvatarURL;
  },
});
