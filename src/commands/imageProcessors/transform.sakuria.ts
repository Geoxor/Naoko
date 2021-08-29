import { defineCommand } from "../../types";
import Discord from "discord.js";
import { getBufferFromUrl, parseBufferFromMessage } from "../../logic/logic.sakuria";
import { transform } from "../../logic/imageProcessors.sakuria";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("transform")
    .setDescription("Transform an image with a pipeline")
    .addStringOption((option) =>
      option.setName("url").setDescription("A URL to fetch the image from").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("pipeline")
        .setDescription(
          "The order of subprocess image processors to chain e.g 'trolley cart wtf miku invert cart'"
        )
        .setRequired(true)
    ),
  requiresProcessing: true,
  execute: async (interaction) => {
    const pipeline = interaction.options.getString("pipeline", true).split(" ");
    const url = interaction.options.getString("url", true);
    if (pipeline.length > 10) return "pipeline can't be longer than 10 iterators";
    const buffer = await getBufferFromUrl(url);
    const resultbuffer = await transform(pipeline, buffer);
    const mimetype = await fileType(resultbuffer);
    const attachment = new Discord.MessageAttachment(resultbuffer, `shit.${mimetype.ext}`);
    return { files: [attachment] };
  },
});
