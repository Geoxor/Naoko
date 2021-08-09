import fs from "fs";
import path from "path";
import axios from "axios";
import morseCodeTable from "../assets/morseCodeTable.json";
import morseCodeTableReverse from "../assets/morseCodeTableReverse.json";
import { IAnilistAnime, IAnime, IMessage } from "../types";
import Jimp from "jimp";

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
  return matcher.substring(0, matcher.length / 2) + matchee.substring(matchee.length / 2)
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
  const strippedString = string.replace(/[a-z0-9]/g, "");
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
    if (file.endsWith(".flac") || file.endsWith(".mp3") || file.endsWith(".ogg") || file.endsWith(".wav")) filelist.push(path.resolve(dir + "/" + file));
  }
  return filelist;
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
 * Inverts the colors of an image
 * @param image the image buffer you wanna invert
 * @returns a buffer of the inverted image
 * @author Geoxor
 */
export async function invertImage(image: Buffer): Promise<Buffer | string> {
  if (!image) throw "image can not be undefined";
  const JimpImage = await Jimp.read(image);
  return JimpImage.invert().getBufferAsync("image/png");
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
 * Creates a trolley image with a given image buffer
 * @param image the buffer to composite to the trolley
 * @author Geoxor, Bluskript
 */
export async function createTrolley(image: Buffer): Promise<Buffer> {
  // This could be optimized
  const trolleyImage = await Jimp.read("./src/assets/images/trolleyTemplate.png")
  const jimpImage = await Jimp.read(image);
  const size = 48;
  jimpImage.resize(size * 2, size);
  return trolleyImage.composite(jimpImage, 4, 24).getBufferAsync('image/png');
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
 * @author azur1s, Geoxor, N1kO23, MaidMarija
 */
export function calcSpread(value: number): number {
  let rng = Math.random();
  let min = value - value * 0.1;
  let max = value + value * 0.1;
  let spread = ~~((max - min) * rng + min);
  return spread;
}