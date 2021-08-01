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
  return morseCharacters.join(" ").replace('/ / /', "/");
}
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