import { defineCommand } from "../../types";
import Discord from "discord.js";
import { getBufferFromUrl, getSourceURL, preProcessBuffer, resolveURL } from "../../logic/logic.sakuria";
import { transform } from "../../logic/imageProcessors.sakuria";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("transform")
    .setDescription("Transform an image with a pipeline")
    .addStringOption((option) =>
      option.setName("source").setDescription("a URL, Emoji or User ID to use as a texture").setRequired(true)
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
    if (pipeline.length > 10) return "pipeline can't be longer than 10 iterators";
    const source = interaction.options.getString("source", true)
    const sourceURL = getSourceURL(source, interaction);
    if (!sourceURL) return "Invalid source type";
    const buffer = await getBufferFromUrl(sourceURL);
    const preProccessed = await preProcessBuffer(buffer);
    const resultbuffer = await transform(pipeline, preProccessed);
    const mimetype = await fileType(resultbuffer);
    const attachment = new Discord.MessageAttachment(resultbuffer, `shit.${mimetype.ext}`);
    return { files: [attachment] };
  },
});
