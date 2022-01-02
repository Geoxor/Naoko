import { definePlugin } from "../shaii/Plugin.shaii";
import { defineCommand } from "../types";
import { getUserAvatarURL } from "../logic/logic.shaii";

export default definePlugin({
  name: "@geoxor/avatar",
  version: "1.0.0",
  command: defineCommand({
    name: "avatar",
    category: "UTILITY",

    usage: "avatar <@user | user_id>",
    description: "Get the avatar of a user or yours",

    execute: async (message) => {
      const otherUser = message.mentions.users.first() || message.client.users.cache.get(message.args[0]) || message.author;
      return getUserAvatarURL(otherUser, message.guild);
    },
  }),
});
