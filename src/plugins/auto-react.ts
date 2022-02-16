import { definePlugin } from "../shaii/Plugin.shaii";

const emojiRegex = /<a:.+?:\d+>|<:.+?:\d+>/g;

export default definePlugin({
  name: "@geoxor/auto-react",
  version: "1.0.0",
  events: {
    messageCreate: (message) => {
      if (message.content.match(/^[a-zA-Z0-9]/g)) {
        for (const matches of message.content.matchAll(emojiRegex)) {
          const emoji = matches[0].match(/:\d+/g)![0].replace(":", "");
          message.react(emoji).catch();
        }
      }
    },
  },
});
