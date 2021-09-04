import { tts } from "../../logic/logic.sakuria";
import { CommandType, defineCommand } from "../../types";
import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("tts")
    .setDescription("Turn a string into text to speech")
    .addStringOption((option) =>
      option.setName("sentence").setDescription("the sentence to turn into text to speech").setRequired(true)
    ),
  type: CommandType.FUN,
  requiresProcessing: true,
  execute: async (interaction) => {
    const sentence = interaction.options.getString("sentence", true);
    const attachment = new Discord.MessageAttachment(
      await tts(sentence),
      `${sentence.split(" ").slice(0, 6).join(" ")}.wav`
    );
    return { files: [attachment] };
  },
});
