import { defineCommand } from "../../types";
import facts from "../../assets/funFacts.json";
import { randomChoice } from "../../logic/logic.sakuria";
import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder().setName("funfact").setDescription("Says a random fun fact"),
  execute: () => {
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
});
