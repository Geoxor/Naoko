import Discord from "discord.js";
import { randomChoice } from "../logic/logic";
import { definePlugin } from "../naoko/Plugin";
import { defineCommand } from "../types";
import facts from "./fun-facts/facts.json" assert { type: 'json' };

export default definePlugin({
  name: "@azur1s/fun-fact",
  version: "1.0.0",
  command: defineCommand({
    name: "funfact",
    category: "FUN",
    usage: "funfact",
    description: "Random fun fact",
    execute: () => {
      const embed = new Discord.EmbedBuilder()
        .setColor("#d2185e")
        .setAuthor({ name: 'Fun Facts by azur' })
        .setThumbnail(randomChoice([
          'https://wiki.hypixel.net/images/0/0a/SkyBlock_items_enchanted_book_and_quill.gif',
          'https://wiki.hypixel.net/images/4/4e/SkyBlock_items_enchanted_book.gif'
        ]))
        .addFields({
          name: "Fun fact:",
          value: `${randomChoice(facts)}`,
          inline: true,
        })
        .setFooter({ text: `Total of ${facts.length} fun facts` });

      return { embeds: [embed] };
    },
  }),
});
