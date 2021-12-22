import { defineCommand } from "../types";
import { definePlugin } from "../shaii/Plugin.shaii";

export default definePlugin({
  name: "@geoxor/avatar",
  version: "v1.0.0",
  command: defineCommand({
    name: "avatar",
    category: "UTILITY",
    aliases: [],
    usage: "avatar <@user | user_id>",
    description: "Get the avatar of a user or yours",
    requiresProcessing: false,
    execute: (message) => {
      const otherUser = message.mentions.users.first() || message.client.users.cache.get(message.args[0]) || message.author;
      const link = (otherUser ? otherUser.avatarURL() : message.author.avatarURL()) || message.author.defaultAvatarURL;
      return link + "?size=2048";
    },
  }),
});
