import { britify } from "../../logic/logic.sakuria";
import { defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";

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
