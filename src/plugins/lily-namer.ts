import { definePlugin } from "../shaii/Plugin.shaii";

export default definePlugin({
  name: "@geoxor/lily-namer",
  version: "1.0.0",
  events: {
    messageCreate: (message) => {
      message.author.id === "587594954084188190" && message.member?.setNickname(message.content.substring(0, 30));
    },
  },
});
