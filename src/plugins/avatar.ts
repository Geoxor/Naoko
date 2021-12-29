import { definePlugin } from "../shaii/Plugin.shaii";
import { defineCommand } from "../types";

export default definePlugin({
  name: "@geoxor/avatar",
  version: "1.0.0",
  command: defineCommand({
    name: "avatar",
    category: "UTILITY",

    usage: "avatar <@user | user_id>",
    description: "Get the avatar of a user or yours",

    execute: (message) => {
      const otherUser = message.mentions.users.first() || message.client.users.cache.get(message.args[0]) || message.author;
      const link = (otherUser ? otherUser.avatarURL() : message.author.avatarURL()) || message.author.defaultAvatarURL;
      return link + "?size=2048";
    },
  }),
});
