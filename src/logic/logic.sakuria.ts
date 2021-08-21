import fs from "fs";
import path from "path";
import axios from "axios";
import morseCodeTable from "../assets/morseCodeTable.json";
import morseCodeTableReverse from "../assets/morseCodeTableReverse.json";
import { IAnilistAnime, IAnime, IMessage } from "../types";
import Discord from "discord.js";

const defaultImageOptions: Discord.ImageURLOptions = {
  format: "png",
  size: 512,
};

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
  const firstEmoji = message.split(emoteRegex)[1] || message.split(animatedEmoteRegex)[1];
  if (firstEmoji) return "https://cdn.discordapp.com/emojis/" + firstEmoji + ".png?v=1";
  else return undefined;
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
  return matcher.substring(0, matcher.length / 2) + matchee.substring(matchee.length / 2);
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
  return string.charAt(0).toUpperCase() + string.slice(1);
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
  const normal = sentence;
  const uwuified = normal
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
  return uwuified;
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
 * Gets a URL from a message, it will try to get a message
 * from replies, attachments, links, or user avatars
 * @author Geoxor & Bluskript
 */
export async function getImageURLFromMessage(message: IMessage): Promise<string> {
  const arg = message.args[0];
  const userMention = message.mentions.users.first();

  // If theres a reply
  if (message.reference) {
    const reference = await message.fetchReference();
    return getMostRelevantImageURL(reference);
  }

  if (isValidHttpUrl(arg)) {
    return arg;
  }

  if (!/[0-9]{18}$/g.test(arg) || userMention || message.content.includes("<:"))
    return getMostRelevantImageURL(message); // this is a hack...

  const user = await message.client.users.fetch(arg);
  return user.displayAvatarURL(defaultImageOptions) || user.defaultAvatarURL;
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
