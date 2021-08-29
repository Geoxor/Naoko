import { defineCommand } from "../../types";
import Discord from "discord.js";
import { getBufferFromUrl, parseBufferFromMessage, preProcessBuffer } from "../../logic/logic.sakuria";
import { imageProcessors, stack } from "../../logic/imageProcessors.sakuria";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";
import { SlashCommandBuilder } from '@discordjs/builders';

// TODO: Refactor this to the main image processors
// so we can easily override the frames for diff
// processors blah blah fuck your mom
const stacks: {
  [key: string]: number;
} = {
  'wasted': 90,
}

const choices: [name: string, value: string][] = Object.keys(imageProcessors).map(name => [name, name])

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("stack")
    .setDescription("Stack an image processor and make a GIF out of it (this might cause seizures)")
    .addStringOption(option => option
      .setName('source')
      .setDescription("A URL to fetch the image from")
      .setRequired(true))
    .addStringOption(option => option
      .setName('processor')
      .setDescription("The image processor to stack")
      .setRequired(true)
      .addChoices(choices))
    .addIntegerOption(option => option
      .setName('fps')
      .setDescription("The framerate (0-60)")
      .setRequired(false)),
  requiresProcessing: true,
  execute: async (interaction) => {
    const source = interaction.options.getString("source", true);
    const processor = interaction.options.getString("processor", true);
    const fps = interaction.options.getInteger("fps", true);
    const buffer = await getBufferFromUrl(source);
    const preProccessed = await preProcessBuffer(buffer);
    const resultbuffer = await stack(processor, preProccessed, stacks[processor], fps);
    const mimetype = await fileType(resultbuffer);
    const attachment = new Discord.MessageAttachment(resultbuffer, `shit.${mimetype.ext}`);
    return { files: [attachment] };
  },
});
