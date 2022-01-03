import Discord from "discord.js";
import { randomChoice } from "../logic/logic.shaii";
import { definePlugin } from "../shaii/Plugin.shaii";
import { defineCommand } from "../types";
import facts from "./fun-facts/facts.json";

export default definePlugin({
  name: "@azur1s/fun-fact",
  version: "1.0.0",
  command: defineCommand({
    name: "funfact",
    category: "FUN",
    usage: "funfact",
    description: "Random fun fact",
    execute: (message) => {
      const embed = new Discord.MessageEmbed()
        .setColor("#d2185e")
        .setAuthor(`Fun Facts by azur`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/806300597338767450/879888079832375326/book.gif`)
        .addFields({
          name: "Fun fact:",
          value: `${randomChoice(facts)}`,
          inline: true,
        })
        .setFooter(`Total of ${facts.length} fun facts`);

      return { embeds: [embed] };
    },
  }),
});
