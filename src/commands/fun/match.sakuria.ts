import { match } from "../../logic/logic.sakuria";
import { defineCommand } from "../../types";
import { SlashCommandBuilder } from '@discordjs/builders';

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("match")
    .setDescription("See how much you and another user match")
    .addUserOption(option => option
      .setName('user')
      .setDescription("the user to match with")
      .setRequired(true)),
  execute: (interaction) => {
      const matcher = interaction.user;
      const matchee = interaction.options.getUser("user", true);
      return match(matcher, matchee);
    ;
  },
});

