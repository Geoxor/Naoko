import { defineCommand } from "../../types";
import answers from "../../assets/answers.json";
import { SlashCommandBuilder } from '@discordjs/builders';

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask Sakuria a question")
    .addStringOption(option => option
      .setName('question')
      .setDescription("the question to ask")
      .setRequired(true)),
  execute: (interaction) => {
    return `Q: ${interaction.options.getString('question', true)}\nA: ${answers[~~(Math.random() * answers.length - 1)]}`;
  },
});
