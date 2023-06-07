import { singleton } from "@triptyk/tsyringe";
import axios from "axios";

type Anime = {
  anilist: number;
  filename: string;
  episode?: number;
  from: number;
  to: number;
  similarity: number;
  video: string;
  image: string;
}

export type AnilistAnime = {
  id: number;
  description: string;
  coverImage: CoverImage;
  title: Title;
  externalLinks: ExternalLinks[];
  bannerImage?: string;
}
export type CoverImage = {
  large: string;
}
export type Title = {
  romaji: string;
  native: string;
}
export type ExternalLinks = {
  url: string;
}

@singleton()
export default class AnimeService {
  /**
   * Tries to find an anime that matches the given URL image
   * @param {string} url a link to a PNG, GIF, JPG or TIFF image
   * @author Geoxor
   */
  async traceAnime(url: string): Promise<Anime> {
    const { data } = await axios.get(`https://api.trace.moe/search?url=${encodeURIComponent(url)}`);
    return data.result[0];
  }

  /**
   * Fetches Anime metadata for a given anilist anime ID
   * @param {number} id An anilist anime ID
   * @author Geoxor
   */
  async anilistQuery(id: number): Promise<AnilistAnime> {
    const variables = { id };
    const query = `query ($id: Int) { Media(id: $id, type: ANIME) { id externalLinks { url } description coverImage { large } title { romaji native } } }`;
    const { data: response } = await axios.post("https://graphql.anilist.co/", { query, variables });
    return response.data.Media;
  }

  /**
   * Fetches Anime metadata for a given anilist anime ID
   * @param {string} search an anime title
   * @author cimok
   */
  async anilistSearch(search: string): Promise<AnilistAnime> {
    const variables = { search };
    const query = `query ($search: String) { Media(search: $search, type: ANIME) { id externalLinks { url } description coverImage { large } title { romaji native } bannerImage } }`;
    const { data: response } = await axios.post("https://graphql.anilist.co/", { query, variables });
    return response.data.Media;
  }
}
