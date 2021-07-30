import Discord from 'discord.js';

export interface IMessage extends Discord.Message {
  command: string;
  args: string[];
}

export interface ICommand {
  execute: Function;
  name: string;
}

export interface IAnime {
  anilist: number;
  filename: string;
  episode?: number;
  from: number;
  to: number;
  similarity: number;
  video: string;
  image: string;
}