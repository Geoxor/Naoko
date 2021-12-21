import fs from "fs";
import path from "path";
import axios from "axios";
import morseCodeTable from "../assets/morseCodeTable.json";
import morseCodeTableReverse from "../assets/morseCodeTableReverse.json";
import { IAnilistAnime, IAnime, ICommand, ImageProcessorFn, IMessage } from "../types";
import Discord, { EmojiIdentifierResolvable, MessageMentions } from "discord.js";
import { speak } from "windows-tts";
import logger from "../shaii/Logger.shaii";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import Jimp from "jimp";
const replaceLast = require("replace-last");

const defaultImageOptions: Discord.ImageURLOptions = {
  format: "png",
  size: 512,
};

export function timeSince(date: number) {
  const seconds = ~~((Date.now() - date) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) return ~~interval + " y";
  interval = seconds / 2592000;

  if (interval > 1) return ~~interval + " mo";
  interval = seconds / 86400;

  if (interval > 1) return ~~interval + " d";
  interval = seconds / 3600;

  if (interval > 1) return ~~interval + " h";
  interval = seconds / 60;

  if (interval > 1) return ~~interval + " min";
  return ~~seconds + " s";
}

export function durationToMilliseconds(duration: string): string {
  const [digits, abbr] = duration.match(/\d{1,3}|\D/g) as string[];
  switch (abbr) {
    case "s" || "S":
      return (parseInt(digits) * 1000).toString();
    case "m" || "M":
      return (parseInt(digits) * 60 * 1000).toString();
    case "h" || "H":
      return (parseInt(digits) * 3600 * 1000).toString();
    case "d" || "D":
      return (parseInt(digits) * 86400 * 1000).toString();
    case "w" || "W":
      return (parseInt(digits) * 604800 * 1000).toString();
    case "t" || "T": // t stands for month since m is already taken for minutes
      return (parseInt(digits) * 2592000 * 1000).toString();
    case "y" || "Y":
      return (parseInt(digits) * 31536000 * 1000).toString();
    default:
      logger.error("Invalid duration");
      return "";
  }
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
  const bar = logger.progress("Encoding  - ", frames.length);
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];

    // Single pallete iteration
    // const idx = applyPalette(frame, palette);
    // Regen pallete every frame
    const idx = applyPalette(frame, quantize(frame, 256));

    gif.writeFrame(idx, width, height, { transparent: true, delay, palette });
    logger.setProgressValue(bar, i / frames.length);
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
 * Fetches and rescales an image from a discord message for
 * it to be deformed by an image processor
 * @param message discord message to get buffer from
 * @returns {Promise<buffer>}
 * @author Geoxor
 */
export async function parseBufferFromMessage(message: IMessage): Promise<Buffer> {
  const imageURL = await getImageURLFromMessage(message);
  const targetBuffer = await getBufferFromUrl(imageURL);
  const preProccessed = await preProcessBuffer(targetBuffer);
  return preProccessed;
}

/**
 * Returns an execute function to use in a image process command
 * @param process the image processor function
 * @author Bluskript
 */
export function imageProcess(process: ImageProcessorFn) {
  return async (message: IMessage): Promise<string | Discord.ReplyMessageOptions> => {
    const buffer = await parseBufferFromMessage(message);
    const resultBuffer = await process(buffer, message.args.join(" "));
    const mimetype = await fileType(resultBuffer);
    const attachment = new Discord.MessageAttachment(resultBuffer, `shit.${mimetype.ext}`);
    return { files: [attachment] };
  };
}

/**
 * Creates commands for the image processor functions
 * @param fns all the image processor functions
 * @author Bluskript
 */
export function genCommands(fns: ImageProcessorFn[]): ICommand[] {
  return fns.map((fn) => {
    const cmdName = fn.name.toLowerCase();
    logger.print(`Generated command ${cmdName}`);
    const command: ICommand = {
      name: cmdName,
      aliases: [],
      usage: `${cmdName} <image | url | reply | user_id>`,
      category: "IMAGE_PROCESSORS",
      description: `${cmdName} an image`,
      requiresProcessing: true,
      execute: imageProcess(fn),
    };
    return command;
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

  return `${used.toFixed(2)}/${total.toFixed(2)}MB`;
}

/**
 * Validate if a string is a valid HTTP URL
 * @param string the string to validate
 * @author Bluskript
 */
export function isValidHttpUrl(string: string) {
  let url;

  try {
    url = new URL(string);
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
export function getFirstEmojiURL(message: string) {
  const emoteRegex = /<:.+:(\d+)>/gm;
  const animatedEmoteRegex = /<a:.+:(\d+)>/gm;
  const staticEmoji = message.split(emoteRegex)[1];
  const animatedEmoji = message.split(animatedEmoteRegex)[1];
  if (staticEmoji) return "https://cdn.discordapp.com/emojis/" + staticEmoji + ".png?v=1";
  if (animatedEmoji) return "https://cdn.discordapp.com/emojis/" + animatedEmoji + ".gif?v=1";
  else return undefined;
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
  if (seconds < 60) return seconds.toFixed(2) + " sec";
  else if (minutes < 60) return minutes.toFixed(2) + " min";
  else if (hours < 24) return hours.toFixed(2) + " hour";
  else return days.toFixed(2) + " days";
}

/**
 * Convert milliseconds to a human readable string, example: 2 years, 67 days, 20 hours, 2 minutes, 24 seconds
 * @param ms milliseconds to convert
 */
export function msToFullTime(ms: number): string {
  const seconds = Number(ms / 1000);
  const y = ~~(seconds / (3600 * 24 * 365));
  const d = ~~((seconds / (3600 * 24)) % 365);
  const h = ~~((seconds % (3600 * 24)) / 3600);
  const m = ~~((seconds % 3600) / 60);
  const s = ~~(seconds % 60);

  const yDisplay = y > 0 && d > 0 ? y + (y === 1 ? " year, " : " years, ") : "";
  const dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
  const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
  const mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
  const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "0 seconds";
  return yDisplay + dDisplay + hDisplay + mDisplay + sDisplay;
}

/**
 * Picks a random item from an array
 * @author MaidMarija
 */
export function randomChoice<T>(l: Array<T>): T {
  return l[~~(Math.random() * l.length)];
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
 * Wraps a string in discord markdown
 * @param string the string to wrap
 * @returns
 */
export const markdown = (string: string | undefined): string => `\`\`\`${string}\`\`\``;

/**
 * Wraps a string in `<string>`
 * @param string the string to wrap
 * @returns
 */
export const highlight = (string: string | undefined): string => `\`${string}\``;

/**
 * Calculate attack damage
 * @param damage the damage
 * @param critChange critical change from 0.0 to 1.0
 * @param critMulti critical multiplier to apply on critical
 * @returns calculated damage
 * @author azur1s
 */
export function calcDamage(damage: number, critChance: number, critMulti: number): number {
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
 * Calculates participation rewards
 * This will split the rewards in equal amount if all the players participated equally
 * The more they participated, the more they get. No more snitching
 * @param {number} participatedDamage damage dealt by the participant
 * @param {number} totalHp total HP of the enemy
 * @param {number} playerAmount the total amount of players/participants
 */
export function calcParticipated(participatedDamage: number, totalHp: number, playerAmount: number): number {
  return participatedDamage / totalHp / playerAmount;
}

/**
 * Uwu-ify sentences
 * @param {string} sentence the sentence to uwu-ify
 * @author azur1s
 */
export function textToUwufy(sentence: string): string {
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
export function textToBritify(sentence: string): string {
  // first delete any disgusting american dialect (IMPORTANT, NEEDS IMPROVEMENT)
  sentence = sentence.replace(/mom/g, "mum");

  // and make some suitable other word replacements
  sentence = sentence.replace(/what/g, "wot");

  // personally "what the fuck mate" sounds better than "what the fuck cunt"
  sentence = sentence.replace(/man|bud(dy)?|bro|fam/g, "mate");

  // we don't use t (sometimes) nor the -ing suffix
  sentence = sentence.replace(/(?<!\s|k|x|')t+(?!(\w*')|h|ch|ion)|(?<=\win)g/g, "'");

  return sentence;
}

/**
 * Spongify a sentence
 * @param sentence the sentence to spongify
 * @param capsOdd if letters to capitalize are the odd ones (by default: true)
 * @author Qexat
 */
export function textToSpongify(sentence: string, capsOdd: boolean = true): string {
  var newSentence = "";
  var lastNotSpaceChar;

  capsOdd ? (newSentence += sentence[0].toUpperCase()) : (newSentence += sentence[0].toLowerCase());

  // upper one character out of 2
  for (let i = 1; i < sentence.length; i++) {
    sentence[i - 1] === " " ? (lastNotSpaceChar = newSentence[i - 2]) : (lastNotSpaceChar = newSentence[i - 1]);
    lastNotSpaceChar === lastNotSpaceChar.toUpperCase()
      ? (newSentence += sentence[i].toLowerCase())
      : (newSentence += sentence[i].toUpperCase());
  }

  return newSentence;
}

/**
 * Brainfuck a sentence
 * @param sentence the sentence to brainfuck
 * @author Qexat // based (copied tbh lol) on HelgeFox's work <https://github.com/helgeh/brainfuck-text>
 */
export function textToBrainfuck(sentence: string): string {
  function closest(num: number, arr: number[]): number {
    const arr2: number[] = arr.map((n: number) => Math.abs(num - n));
    const min: number = Math.min.apply(null, arr2);
    return arr[arr2.indexOf(min)];
  }

  function buildBaseTable(arr: number[]): string {
    const out = { value: "", append: (txt: string) => (out.value += txt) };
    out.append("+".repeat(10));
    out.append("[");
    arr.forEach((cc: number) => {
      out.append(">");
      out.append("+".repeat(cc / 10));
    });
    out.append("<".repeat(arr.length));
    out.append("-");

    out.append("]");
    return out.value;
  }

  const output = { value: "", append: (txt: string) => (output.value += txt) };

  const charArray: number[] = sentence.split("").map((c) => c.charCodeAt(0));
  const baseTable: number[] = charArray
    .map((c: number) => Math.round(c / 10) * 10)
    .filter((i: number, p: number, s: number[]) => s.indexOf(i) === p);

  output.append(buildBaseTable(baseTable));

  let pos: number = -1;
  for (let i = 0; i < charArray.length; i++) {
    const bestNum: number = closest(charArray[i], baseTable);
    const bestPos: number = baseTable.indexOf(bestNum);

    const moveChar: string = pos < bestPos ? ">" : "<";
    output.append(moveChar.repeat(Math.abs(pos - bestPos)));
    pos = bestPos;

    const opChar: string = baseTable[pos] < charArray[i] ? "+" : "-";
    output.append(opChar.repeat(Math.abs(baseTable[pos] - charArray[i])));
    output.append(".");
    baseTable[pos] = charArray[i];
  }

  return output.value;
}

/**
 * Gets an image url from attachments > stickers > first emoji > mentioned user avatar > author avatar > default avatar
 * @param message the discord message to fetch from
 * @author Bluskript
 */
export function getMostRelevantImageURL(message: Discord.Message) {
  return (
    message.attachments.first()?.url ||
    message.stickers.first()?.url ||
    getFirstEmojiURL(message.content) ||
    message.mentions.users.first()?.displayAvatarURL(defaultImageOptions) ||
    message.author.displayAvatarURL(defaultImageOptions) ||
    message.author.defaultAvatarURL
  );
}

/**
 * Generates text to speech wav buffer from a string
 * @param string the string to text to speech
 * @author Geoxor
 */
export async function tts(string: string): Promise<Buffer> {
  return speak(string);
}

export function findIndexOfURL(array: string[]) {
  for (let i = 0; i < array.length; i++) {
    if (isValidHttpUrl(array[i])) return i;
  }
  return -1;
}

/**
 * Gets a URL from a message, it will try to get a message
 * from replies, attachments, links, or user avatars
 * @author Geoxor & Bluskript
 */
export async function getImageURLFromMessage(message: IMessage): Promise<string> {
  const arg = message.args[findIndexOfURL(message.args)];
  const userMention = message.mentions.users.first();

  // If theres a reply
  if (message.reference) {
    const reference = await message.fetchReference();
    return replaceLast(getMostRelevantImageURL(reference), ".webp", ".png");
  }

  if (isValidHttpUrl(arg)) {
    if (arg.startsWith("https://tenor") && !arg.endsWith(".gif")) {
      return arg + ".gif";
    }
    return replaceLast(arg, ".webp", ".png");
  }

  if (!/[0-9]{18}$/g.test(arg) || userMention || message.content.includes("<:")) return getMostRelevantImageURL(message); // this is a hack...

  const user = await message.client.users.fetch(arg);
  return replaceLast(user.displayAvatarURL(defaultImageOptions), ".webp", ".png") || user.defaultAvatarURL;
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
    if (file.endsWith(".flac") || file.endsWith(".mp3") || file.endsWith(".ogg") || file.endsWith(".wav"))
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
export async function getLastAttachmentInChannel(message: IMessage) {
  const messages = await message.channel.messages.fetch();
  const lastMessage = messages
    .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
    .filter((m) => m.attachments.size > 0)
    .first();
  return lastMessage?.attachments.first()?.attachment;
}

/**
 * Remove any mention in the message
 * @param messageContent content of the message to clean
 * @returns content of the message cleaned of any mention
 * @author Qexat
 */
export function removeMentions(messageContent: string): string {
  return messageContent
    .replace(MessageMentions.CHANNELS_PATTERN, "")
    .replace(MessageMentions.EVERYONE_PATTERN, "")
    .replace(MessageMentions.ROLES_PATTERN, "")
    .replace(MessageMentions.USERS_PATTERN, "");
}
