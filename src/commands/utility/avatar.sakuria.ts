import { defineCommand } from "../../types";
export default defineCommand({
  name: "avatar",
  description: "Get the avatar of a user or yours",
  requiresProcessing: false,
  execute: (message) => {
    const otherUser = message.mentions.users.first();
    const link =
      (otherUser ? otherUser.avatarURL() : message.author.avatarURL()) || message.author.defaultAvatarURL;
    return link + "?size=2048";
  },
});
