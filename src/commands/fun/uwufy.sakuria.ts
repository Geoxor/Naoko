import { CommandType, defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import { uwufy } from "../../logic/formatters.sakuria";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("uwufy")
    .setDescription("Turn a sentence into UwU")
    .addStringOption((option) =>
      option.setName("sentence").setDescription("the sentence to uwufy").setRequired(true)
    ),
  type: CommandType.FUN,
  execute: (interaction) => uwufy(interaction.options.getString("sentence", true)),
});
