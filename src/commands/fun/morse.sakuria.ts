import { CommandType, defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import { decodeMorse, encodeMorse } from "../../logic/formatters.sakuria";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("morse")
    .setDescription("Encode/Decode morse")
    .addStringOption((option) =>
      option
        .setName("method")
        .setDescription("the method to use")
        .setRequired(true)
        .addChoice("encode", "encode")
        .addChoice("decode", "decode")
    )
    .addStringOption((option) =>
      option.setName("string").setDescription("the string to parse").setRequired(true)
    ),
  type: CommandType.FUN,
  execute: (interaction) => {
    const method = interaction.options.getString("method", true);
    const string = interaction.options.getString("string", true);
    return method === "encode" ? encodeMorse(string) : decodeMorse(string);
  },
});
