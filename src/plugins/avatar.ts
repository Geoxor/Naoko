import { definePlugin } from "../shaii/Plugin.shaii";
import { defineCommand } from "../types";
import config from "../shaii/Config.shaii";

import Axios from "axios";

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
      let link;

      if (message.guild) {
        const req = await Axios.get(`https://discord.com/api/guilds/${message.guild.id}/members/${otherUser.id}`, {
          headers: {
            Authorization: `Bot ${config.token}`
          }
        });

        if (req.data.avatar) {
          link = `https://cdn.discordapp.com/guilds/${message.guild.id}/users/${otherUser.id}/avatars/${req.data.avatar}.png`;
        }
      }

      if (!link) link = (otherUser ? otherUser.avatarURL() : message.author.avatarURL()) || message.author.defaultAvatarURL;

      return link + "?size=2048";
    },
  }),
});
