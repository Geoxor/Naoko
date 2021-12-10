import { defineCommand } from "../../types";
export default defineCommand({
  name: "avatar",
  category: "UTILITY",
  aliases: [],
  usage: "avatar <@user | user_id>",
  description: "Get the avatar of a user or yours",
  requiresProcessing: false,
  execute: (message) => {
    const otherUser = message.mentions.users.first() || message.guild.members.cache.get(message.args[0])?.user;
    const link = (otherUser ? otherUser.avatarURL() : message.author.avatarURL()) || message.author.defaultAvatarURL;
    return link + "?size=2048";
  },
});
