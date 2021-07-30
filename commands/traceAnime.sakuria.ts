import { IMessage } from "../types";
import Discord from 'discord.js';
import axios from 'axios';

export interface Anime {
  anilist: number;
  filename: string;
  episode?: number;
  from: number;
  to: number;
  similarity: number;
  video: string;
  image: string;
}

async function traceAnime(url: string): Promise<Anime> {
  const { data } = await axios.get(`https://api.trace.moe/search?url=${encodeURIComponent(url)}`);
  return data.result[0];
}

export const command = {
  name: "trace",
  execute: async (message: IMessage): Promise<void> => {
    const anime = await traceAnime(message.args[0]);
  
    // prepare an embed to send to the user
    const embed = new Discord.MessageEmbed()
      .setColor('#ffffff')
      .setTitle(anime.filename)
      .addField("Episode",    anime.episode?.toString()   || 'Unknown', true)
      .addField("Anilist",    anime.anilist?.toString()   || 'Unknown', true)
      .addField('Confidence', anime.similarity.toString() || 'Unknown', true)
      .addField('From',       anime.from.toString()       || 'Unknown', true)
      .addField('To',         anime.to.toString()         || 'Unknown', true)
      .setImage(anime.image)

    await message.reply({ embeds: [embed] });
  }
}