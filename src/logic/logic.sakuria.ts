import fs from "fs";
import path from "path";
import axios from "axios";
import morseCodeTable from "../assets/morseCodeTable.json";
import morseCodeTableReverse from "../assets/morseCodeTableReverse.json";
import { IAnilistAnime, IAnime, ICommand, ImageProcessorFn, IMessage } from "../types";
import Discord, { CommandInteraction } from "discord.js";
import { speak } from "windows-tts";
import logger from "../sakuria/Logger.sakuria";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import Jimp from "jimp";
import { SlashCommandBuilder } from "@discordjs/builders";

const defaultImageOptions: Discord.ImageURLOptions = {
  format: "png",
  size: 512,
};

/**
 * Creates commands for the image processor functions
 * @param fns all the image processor functions
 * @author Bluskript
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
          option.setName("source").setDescription("a URL, Emoji or User ID to use as a texture").setRequired(true)
        ),
      requiresProcessing: true,
      execute: imageProcess(fn),
    };
  });
}

/**
 * Gets the used/total heap in ram used
 * @author Geoxor
 */
export function getCurrentMemoryHeap() {
  const mem = process.memoryUsage();
  const used = mem.heapUsed / 1000 / 1000;
  const total = mem.heapTotal / 1000 / 1000;

  const usedPadded = used < 100 ? "0" + used.toFixed(2) : used.toFixed(2);
  const totalPadded = total < 100 ? "0" + total.toFixed(2) : total.toFixed(2);

  return `${usedPadded}/${totalPadded}MB`;
}

/**
 * Gets the RGBA values of an image
 * @param buffer the buffer to get the values from
 * @author Geoxor & Bluskript
 * @returns a tuple array containing RGBA pairs
 */
export async function getRGBAUintArray(image: Jimp) {
  const texels = 4; /** Red Green Blue and Alpha */
  const data = new Uint8Array(texels * image.bitmap.width * image.bitmap.height);
  for (let y = 0; y < image.bitmap.height; y++) {
    for (let x = 0; x < image.bitmap.width; x++) {
      let color = image.getPixelColor(x, y);
      let r = (color >> 24) & 255;
      let g = (color >> 16) & 255;
      let b = (color >> 8) & 255;
      let a = (color >> 0) & 255;
      const stride = texels * (x + y * image.bitmap.width);
      data[stride] = r;
      data[stride + 1] = g;
      data[stride + 2] = b;
      data[stride + 3] = a;
    }
  }
  return data;
}

/**
 * Encodes a GIF out of an array of an RGBA texel array
 * @param frames an RGBA texel array of frames
 * @param delay the delay between each frame in ms
 * @author Geoxor & Bluskript
 * @returns {Promise<Buffer>} the gif as a buffer
 */
export async function encodeFramesToGif(
  frames: Uint8ClampedArray[] | Uint8Array[],
  width: number,
  height: number,
  delay: number
) {
  const gif = GIFEncoder();
  const palette = quantize(frames[0], 256);
  const bar = logger.sakuria.progress("Encoding  - ", frames.length);
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const idx = applyPalette(frame, palette);
    gif.writeFrame(idx, width, height, { transparent: true, delay, palette });
    logger.sakuria.setProgressValue(bar, i / frames.length);
  }

  gif.finish();
  return Buffer.from(gif.bytes());
}

/**
 * Preprocesses an image so it eliminates huge images from developing
 * @returns a 256x256 png buffer
 * @author Geoxor
 */
export async function preProcessBuffer(buffer: Buffer) {
  const image = await Jimp.read(buffer);
  if (image.bitmap.width > 512) {
    image.resize(512, Jimp.AUTO);
    return image.getBufferAsync("image/png");
  }
  return buffer;
}

/**
 * Returns a random number between -1 and +1;
 * @author Bluskript & Geoxor
 */
export const bipolarRandom = () => Math.random() * 2 - 1;

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
    return error.response?.data?.error || error.response?.statusText || "Couldn't find anime..";
  }
}

export function getSourceURL(source: string, interaction: CommandInteraction) {
  return 0
    || getEmojiURL(source)
    || getAvatarURLFromID(source, interaction) 
    || (isValidHttpUrl(source) ? resolveTenor(source) : undefined);
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

/**
 * Validate if a string is a valid HTTP URL
 * @param string the string to validate
 * @author Bluskript
 */
export function isValidHttpUrl(string: string) {
  try {
    var url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

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
 * Convert milliseconds to human readable
 * @param ms miliseconds to convert
 * @author Geoxor
 */
export function msToTime(ms: number) {
  const seconds = ms / 1000;
  const minutes = ms / (1000 * 60);
  const hours = ms / (1000 * 60 * 60);
  const days = ms / (1000 * 60 * 60 * 24);
  if (seconds < 60) return seconds + " sec";
  else if (minutes < 60) return minutes + " min";
  else if (hours < 24) return hours + " hour";
  else return days + " days";
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
 * Picks a random item from an array
 * @author MaidMarija
 */
export function randomChoice<T>(l: Array<T>): T {
  return l[Math.floor(Math.random() * l.length)];
}

/**
 * Combines 2 user's names to create a ship name
 * @param matcher first half of the shipname
 * @param matchee second half of the shiipname
 * @returns {string} the ship name
 * @author Geoxor
 */
export function getShipName(matcher: string, matchee: string) {
  return matcher.substring(0, matcher.length >> 1) + matchee.substring(matchee.length >> 1);
}

/**
 * Encodes an alphanumerical string to Morse code
 * @param {string} string an alphanumerical string to encode
 * @author Geoxor
 */
export function encodeMorse(string: string): string {
  const strippedString = string.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const characterArray = strippedString.split("");
  const morseCharacters = characterArray.map((a: string) => (morseCodeTable as any)[a]);
  return morseCharacters.join(" ").replace("/ / /", "/");
}

/**
 * Decodes Morse code to an alphanumerical string
 * @param {string} string a Morse code string
 * @author Dave69
 */
export function decodeMorse(string: string): string {
  const strippedString = string.replace(/[a-zA-Z0-9]/g, "");
  const characterArray = strippedString.split(" ");
  const morseCharacters = characterArray.map((a: string) => (morseCodeTableReverse as any)[a]);
  return morseCharacters.join("");
}

/**
 * Capitalizes the first character of a string
 * @param string the string to capitalize
 * @author Bluskript
 */
export function capitalizeFirstLetter(string: string) {
  const result = [];
  const words = string.split(" ");
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    result.push(word.charAt(0).toUpperCase() + word.slice(1));
  }
  return result.join(" ");
}

/**
 * Parses a filename e.g rem.png to Rem
 * @param fileName the file to parse
 * @author Geoxor
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
 */
export function randomDickSize(): number {
  const x = Math.random();
  return Math.min(~~(1 / (1 - x) + 30 * x), 1_000_000);
}

/**
 * Calculate attack damage
 * @returns damage
 * @author azur1s
 */
export function calcDamage(): number {
  let damage = 100;
  let critChance = 0.5;
  let critMulti = 2;
  let rng = Math.random(); //😎

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
  let rng = Math.random();
  let min = value - value * 0.1;
  let max = value + value * 0.1;
  let spread = ~~((max - min) * rng + min);
  return spread;
}

/**
 * Uwu-ify sentences
 * @param {string} sentence the sentence to uwu-ify
 * @author azur1s
 */
export function uwufy(sentence: string): string {
  return sentence
    .replace(/(?:r|l)/g, "w")
    .replace(/(?:R|L)/g, "W")
    .replace(/u/g, "oo")
    .replace(/U/g, "OO")
    .replace(/n([aeiou])/g, "ny$1")
    .replace(/N([AEIOU])/g, "NY$1")
    .replace(/ove/g, "uv")
    .split(" ")
    .map((val) => {
      return Math.random() < 0.1 ? `${val.charAt(0)}-${val}` : `${val}`;
    })
    .join(" ");
}

/**
 * Britishize a sentence
 * @param sentence the sentence to britishize
 * @author Geoxor & MaidMarija
 */
export function britify(sentence: string): string {
  // first delete any disgusting american dialect (IMPORTANT, NEEDS IMPROVEMENT)
  sentence = sentence.replace(/mom/g, "mum");

  // and make some suitable other word replacements
  sentence = sentence.replace(/what/g, "wot");

  // personally "what the fuck mate" sounds better than "what the fuck cunt"
  sentence = sentence.replace(/man|bud(dy)?|bro/g, "mate");

  // we don't use t (sometimes) nor the -ing suffix
  sentence = sentence.replace(/(?<!\s|k|x|')t+(?!(\w*')|h|ch|ion)|(?<=\win)g/g, "'");

  return sentence;
}

/**
 * Generates text to speech wav buffer from a string
 * @param string the string to text to speech
 * @author Geoxor
 */
export async function tts(string: string): Promise<Buffer> {
  return speak(string);
}

/**
 * Finds the index of a URL in an array of strings
 * @param array the array to search
 * @returns {number} the index of the first URL in the array
 * @author Geoxor
 */
export function findIndexOfURL(array: string[]) {
  for (let i = 0; i < array.length; i++) {
    if (isValidHttpUrl(array[i])) return i;
  }
  return -1;
}

/**
 * Fixes tenor URLs
 * @param url parses a url
 * @author Geoxor
 */
export function resolveTenor(url: string): string {
  if (url.startsWith("https://tenor") && !url.endsWith(".gif")) {
    return url + ".gif";
  }
  return url;
}

/**
 * Tries to find an anime that matches the given URL image
 * @param {string} url a link to a PNG, GIF, JPG or TIFF image
 * @author Geoxor
 * @copyright trace.moe
 */
export async function traceAnime(url: string): Promise<IAnime> {
  const { data } = await axios.get(`https://api.trace.moe/search?url=${encodeURIComponent(url)}`);
  return data.result[0];
}

/**
 * Fetches Anime metadata for a given anilist anime ID
 * @param {number} animeID an anilist anime ID
 * @author Geoxor
 * @copyright anilist
 */
export async function anilistQuery(id: number): Promise<IAnilistAnime> {
  const variables = { id };
  const query = `query ($id: Int) { Media(id: $id, type: ANIME) { id externalLinks { url } description coverImage { large } title { romaji native } } }`;
  const { data: response } = await axios.post("https://graphql.anilist.co/", { query, variables });
  return response.data.Media;
}

/**
 * Fetches Anime metadata for a given anilist anime ID
 * @param {string} search an anime title
 * @author cimok
 * @copyright anilist
 */
export async function anilistSearch(search: string): Promise<IAnilistAnime> {
  const variables = { search };
  const query = `query ($search: String) { Media(search: $search, type: ANIME) { id externalLinks { url } description coverImage { large } title { romaji native } bannerImage } }`;
  const { data: response } = await axios.post("https://graphql.anilist.co/", { query, variables });
  return response.data.Media;
}

/**
 * Recursive function that looks through directory and its subdirectories for audio files
 * @param {string} dir The directory what the function is looking
 * @param {string[]} [filelist] optional parameter, contains the list of already located files and their absolute paths
 * @author N1kO23
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

/**
 * Gets a file from a url and creates a buffer out of it
 * @param url the url to a file to get a buffer from
 * @returns a fuffer of the file
 * @author Geoxor
 */
export async function getBufferFromUrl(url: string) {
  const response = await axios({ method: "GET", url, responseType: "arraybuffer" });
  return Buffer.from(response.data);
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
