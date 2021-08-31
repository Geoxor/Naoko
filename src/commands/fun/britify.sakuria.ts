import { defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import { britify } from "../../logic/formatters.sakuria";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("britify")
    .setDescription("Turn a sentence into british")
    .addStringOption((option) =>
      option.setName("sentence").setDescription("the sentence to britify").setRequired(true)
    ),
  execute: (interaction) => {
    return britify(interaction.options.getString("sentence", true));
  },
});
