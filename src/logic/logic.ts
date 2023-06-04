import axios from "axios";
import Discord, { Message, MessageMentions } from "discord.js";
import fs from "fs";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import gifenc from "gifenc";
import Jimp from "jimp";
import path from "path";
import { logger } from "../naoko/Logger";
import { IAnilistAnime, IAnime, ImageProcessorFn, IMessage } from "../types";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import replaceLast from 'replace-last';

const defaultImageOptions: Discord.ImageURLOptions = {
  extension: "png",
  size: 2048,
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
    case "s":
    case "S":
      return (parseInt(digits) * 1000).toString();
    case "m":
    case "M":
      return (parseInt(digits) * 60 * 1000).toString();
    case "h":
    case "H":
      return (parseInt(digits) * 3600 * 1000).toString();
    case "d":
    case "D":
      return (parseInt(digits) * 86400 * 1000).toString();
    case "w":
    case "W":
      return (parseInt(digits) * 604800 * 1000).toString();
    case "t": // t stands for month since m is already taken for minutes
    case "T":
      return (parseInt(digits) * 2592000 * 1000).toString();
    case "y":
    case "Y":
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
  const gif = gifenc.GIFEncoder();
  const palette = gifenc.quantize(frames[0], 256);
  const bar = logger.progress("Encoding  - ", frames.length);
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const idx = gifenc.applyPalette(frame, palette);
    gif.writeFrame(idx, width, height, { transparent: true, delay, palette });
    logger.setProgressValue(bar, i / frames.length);
  }

  gif.finish();
  return Buffer.from(gif.bytes());
}

/**
 * Returns a random number between -1 and +1;
 * @author Bluskript & Geoxor
 */
// TODO: Move to ImageProcessor
export const bipolarRandom = () => Math.random() * 2 - 1;

/**
 * Gets the used/total heap in ram used
 * @author Geoxor
 */
// TODO: Move to Logger
export function getCurrentMemoryHeap() {
  const mem = process.memoryUsage();
  const used = mem.heapUsed / 1000 / 1000;
  const total = mem.heapTotal / 1000 / 1000;

  return `${used.toFixed(2)}/${total.toFixed(2)}MB`;
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
 * Wraps a string in discord markdown
 * @param string the string to wrap
 * @returns
 */
export const markdown = (string: string | undefined): string => `\`\`\`${string}\`\`\``;

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
 * Remove any mention in the message
 * @param messageContent content of the message to clean
 * @returns content of the message cleaned of any mention
 * @author Qexat
 */
export function removeMentions(messageContent: string): string {
  return messageContent
    .replace(MessageMentions.ChannelsPattern, "")
    .replace(MessageMentions.EveryonePattern, "")
    .replace(MessageMentions.RolesPattern, "")
    .replace(MessageMentions.UsersPattern, "");
}

