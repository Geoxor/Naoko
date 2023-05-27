import { SHAII_ID } from "../constants";
import { randomChoice } from "../logic/logic";
import { definePlugin } from "../naoko/Plugin";
import answers from "./mention-replies/answers.json" assert { type: 'json' };

export default definePlugin({
  name: "@geoxor/mention-replies",
  version: "1.0.0",
  events: {
    messageCreate: (message) => {
      if (!message.channel.isTextBased()) return
      if (!message.inGuild()) return;
      if (message.guild.channels.cache.get(message.channelId)!.name === "general") return
      if (!message.content.startsWith("<@" + SHAII_ID)) return;

      // Reply with this when they purely ping her with no question
      !message.content.substring(`<@!${SHAII_ID}>`.length).trim() ? message.reply("what tf do you want") : message.reply(randomChoice(answers))

      return;
    },
  },
});
