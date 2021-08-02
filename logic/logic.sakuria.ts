import fs from "fs";
import path from "path";
import axios from "axios";
import morseCodeTable from "../assets/morseCodeTable.json";
import morseCodeTableReverse from "../assets/morseCodeTableReverse.json";
import { IAnilistAnime, IAnime } from "../types";

/**
 * Encodes an alphanumerical string to Morse code
 * @param {string} string an alphanumerical string to encode
 * @author Geoxor
 */
export function encodeMorse(string: string): string {
  const strippedString = string.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const characterArray = strippedString.split("");
  const morseCharacters = characterArray.map((a: string) => (morseCodeTable as any)[a]);
  return morseCharacters.join(" ");
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
  files.forEach(async function (file) {
    if ((await fs.promises.stat(dir + "/" + file)).isDirectory()) {
      filelist = await walkDirectory(dir + "/" + file, filelist);
    } else {
      if (file.endsWith(".flac") || file.endsWith(".mp3") || file.endsWith(".ogg") || file.endsWith(".wav")) filelist.push(path.resolve(dir + "/" + file));
    }
  });
  return filelist;
}

/**
 * Uwu-ify sentences
 * @author azur1s
 */
 export async function uwuify(sentence: string): Promise<string> {
  const normal = sentence;
  const uwuified = normal
    .replace(/(?:r|l)/g, "w")
    .replace(/(?:R|L)/g, "W")
    .replace(/n([aeiou])/g, "ny$1")
    .replace(/N([aeiouAEIOU])/g, "Ny$1")
    .replace(/ove/g, "uv")
    .split(" ")
    .map((val) => {
      return Math.random() < 0.1 ? `${val.charAt(0)}-${val}` : `${val}`;
    })
    .join(" ");
  return uwuified;
}
