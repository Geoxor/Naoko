import fs from "fs";
import path from "path";
import { AxiosError } from "axios";
import { IAnilistAnime, IAnime, ICommand, ImageProcessorFn } from "../types";
import Discord, { CommandInteraction } from "discord.js";
import { speak } from "windows-tts";
import logger from "../sakuria/Logger.sakuria";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";
import { SlashCommandBuilder } from "@discordjs/builders";
import { capitalizeFirstLetter, getShipName } from "./formatters.sakuria";
import { isValidHttpUrl, resolveTenor } from "./validators.sakuria";
import { anilistSearch, getBufferFromUrl } from "./network.sakuria";

export const defaultImageOptions: Discord.ImageURLOptions = {
  dynamic: true,
  format: "png",
  size: 512,
};

/**
 * Creates commands for the image processor functions
 * @param fns all the image processor functions
 * @author Bluskript
 * @pure
 */
export function genCommands(fns: ImageProcessorFn[]): ICommand[] {
  return fns.map((fn) => {
    const cmdName = fn.name.toLowerCase();
    logger.command.print(`Generated command ${cmdName}`);
    return {
      data: new SlashCommandBuilder()
        .setName(cmdName)
        .setDescription(`${cmdName} image processor`)
        .addStringOption((option) =>
          option
            .setName("source")
            .setDescription("a URL, Emoji or User ID to use as a texture")
            .setRequired(true)
        ),
      type: CommandType.IMAGE_PROCESSORS,
      requiresProcessing: true,
      execute: imageProcess(fn),
    };
  });
}

/**
 * Returns a random number between -1 and +1;
 * @author Bluskript & Geoxor
 * @pure
 */
export const bipolarRandom = () => Math.random() * 2 - 1;

/**
 * Picks a random item from an array
 * @author MaidMarija
 * @pure
 */
export function randomChoice<T>(l: Array<T>): T {
  return l[Math.floor(Math.random() * l.length)];
}

/**
 * Parses a filename e.g rem.png to Rem
 * @param fileName the file to parse
 * @author Geoxor
 * @pure
 * @deprecated
 */
export function getWaifuNameFromFileName(filename: string) {
  let parsedWaifuName = filename.replace(/\.[^.]*$/, "").replace(/_/g, " ");
  return parsedWaifuName
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
}

/**
 * Gets a random number between 1 and 1.000.000 with an exponential factor
 * @author MaidMarija
 * @pure
 */
export function randomDongSize(): number {
  const x = Math.random();
  return Math.min(~~(1 / (1 - x) + 30 * x), 1_000_000);
}

/**
 * Generates text to speech wav buffer from a string
 * @param string the string to text to speech
 * @author Geoxor
 * @pure
 */
export async function tts(string: string): Promise<Buffer> {
  return speak(string);
}

/**
 * Finds the index of a URL in an array of strings
 * @param array the array to search
 * @returns {number} the index of the first URL in the array
 * @author Geoxor
 * @pure
 */
export function findIndexOfURL(array: string[]) {
  for (let i = 0; i < array.length; i++) {
    if (isValidHttpUrl(array[i])) return i;
  }
  return -1;
}

/**
 * Recursive function that looks through directory and its subdirectories for audio files
 * @param {string} dir The directory what the function is looking
 * @param {string[]} [filelist] optional parameter, contains the list of already located files and their absolute paths
 * @author N1kO23
 * @pure
 */
export async function walkDirectory(dir: string, filelist: string[] = []): Promise<string[]> {
  const files = await fs.promises.readdir(dir);
  for (let file of files) {
    const isDirectory = (await fs.promises.stat(dir + "/" + file)).isDirectory();
    if (isDirectory) filelist = await walkDirectory(dir + "/" + file, filelist);
    filelist.push(path.resolve(dir + "/" + file));
  }
  return filelist;
}

/************************************************************************************** */
/**  TODO: Purify these functions

/**
 * This uses RegEx to filter out the different parts of an emoji as a string.
 * A standard emoji would look like: <:emojiname:emojiID> eg. <:BBwave:562730391362994178>
 * An animated emoji would look like: <a:emojiname:emojiID>
 * @param message message to parse
 * @author Geoxor
 */
export function getEmojiURL(message: string) {
  const emoteRegex = /<:.+:(\d+)>/gm;
  const animatedEmoteRegex = /<a:.+:(\d+)>/gm;
  const staticEmoji = message.split(emoteRegex)[1];
  const animatedEmoji = message.split(animatedEmoteRegex)[1];
  if (staticEmoji) return "https://cdn.discordapp.com/emojis/" + staticEmoji + ".png?v=1";
  if (animatedEmoji) return "https://cdn.discordapp.com/emojis/" + animatedEmoji + ".gif?v=1";
  else return undefined;
}

/**
 * Searches for an anime on the internet
 * @param query the anime to search for
 * @returns {Discord.MessageEmbed | string} a Discord message of the resulting anime
 * @author Geoxor
 */
export async function animeQuery(query: string) {
  try {
    const animeMeta = await anilistSearch(query);
    // prepare an embed to send to the user
    const embed = new Discord.MessageEmbed()
      .setColor("#FF90E0")
      .setThumbnail(animeMeta.coverImage.large)
      .setDescription(animeMeta.description.replace(/<br>/g, ""));
    if (animeMeta.bannerImage) embed.setImage(animeMeta.bannerImage);
    if (animeMeta.externalLinks[0]?.url)
      embed.setTitle(
        `${animeMeta.title.romaji}\n${animeMeta.title.native}\n${animeMeta.externalLinks[0]?.url}`
      );
    else embed.setTitle(`${animeMeta.title.romaji}\n${animeMeta.title.native}`);
    return { embeds: [embed] };
  } catch (error) {
    const err = error as AxiosError;
    return err.response?.data?.error || err.response?.statusText || "Couldn't find anime..";
  }
}

/**
 * Gets the last image in a channel and creates a buffer out of it
 * @param message discord message
 * @returns a buffer of the last attachment
 * @author Geoxor
 */
export async function getLastAttachmentInChannel(channel: Discord.TextChannel) {
  const messages = await channel.messages.fetch();
  const lastMessage = messages
    .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
    .filter((m) => m.attachments.size > 0)
    .first();
  return lastMessage?.attachments.first()?.attachment;
}

/**
 * Get's a user's avatar from an ID through an interaction if the
 * ID passes validation
 *
 * It is kinda hacky
 * @param id the user id to check
 * @param interaction the interaction
 * @author Geoxor
 */
export function getAvatarURLFromID(id: string, interaction: CommandInteraction) {
  if (/[0-9]{18}$/g.test(id)) {
    const avatarURL = interaction.guild?.members.cache.get(id)?.user.displayAvatarURL(defaultImageOptions);
    return avatarURL;
  }
}

/**
 * Creates a match string to send to Discord
 * @param matcher the user to match with
 * @param matchee the user to match with
 * @returns {String}
 * @author Geoxor
 */
export function match(matcher: Discord.User, matchee: Discord.User) {
  const matcherValue = parseInt(matcher.id);
  const matcheeValue = parseInt(matchee.id as string);
  const matchValue = (matcherValue + matcheeValue) % 22;
  const matchCalculation = ((22 - matchValue) / 22) * 100;

  const shipName = getShipName(matcher.username, matchee.username);

  const perfectMatchString = `You perfectly match ${~~matchCalculation}% ${shipName}`;
  const matchString = `You match ${~~matchCalculation}% ${shipName}`;
  return matchCalculation == 100 ? perfectMatchString : matchString;
}

/**
 * Figures out what type of input the user has given as the source
 * and gets the url for that type
 * @param source the source to get the URL from
 * @param interaction the discord interaction to scope from
 * @returns the URL of the source
 * @author Geoxor
 */
export function getSourceURL(source: string, interaction: CommandInteraction) {
  return (
    0 ||
    getEmojiURL(source) ||
    getAvatarURLFromID(source, interaction) ||
    (isValidHttpUrl(source) ? resolveTenor(source) : undefined)
  );
}

/**
 * Returns an execute function to use in a image process command
 * @param process the image processor function
 * @author Bluskript & Geoxor
 */
export function imageProcess(process: ImageProcessorFn) {
  return async (interaction: CommandInteraction): Promise<string | Discord.ReplyMessageOptions> => {
    // Get the user's input
    const source = interaction.options.getString("source", true);

    const sourceURL = getSourceURL(source, interaction);

    if (!sourceURL) return "Invalid source type";

    // Load the URL into a buffer
    const buffer = await getBufferFromUrl(sourceURL);

    // Process the buffer with the selected image processor
    const resultbuffer = await process(buffer);

    // Check if the result is a GIF or PNG
    const mimetype = await fileType(resultbuffer);

    // Create an attachment with the correct file extension
    // so discord plays it properly in chat
    const attachment = new Discord.MessageAttachment(resultbuffer, `shit.${mimetype.ext}`);

    return { files: [attachment] };
  };
}

/*********************************************************************************** */
/** these should be moved to the battle class as methods */

/**
 * Calculate attack damage
 * @returns damage
 * @author azur1s
 */
export function calcDamage(): number {
  let damage = 100;
  const critChance = 0.5;
  const critMulti = 2;
  const rng = Math.random(); //😎

  if (rng > critChance) damage = damage * critMulti;

  return damage;
}

/**
 * Calculate defense from armor
 * @returns armor
 * @author azur1s
 */
export function calcDefense(defense: number): number {
  defense = defense / (defense + 100);
  return defense;
}

/**
 * Calculates an RNG number -+10% of a given number
 * If value is 1000 then 900 is minimum and 1100 is maximum
 * We get it from adding/subtracting 10% of the value (1000) given
 * Please, if you have a better formula, you can fix it.
 * @params value
 * @returns rng spread
 * @author azur1s & MaidMarija
 */
export function calcSpread(value: number): number {
  const rng = Math.random();
  const min = value - value * 0.1;
  const max = value + value * 0.1;
  const spread = ~~((max - min) * rng + min);
  return spread;
}
