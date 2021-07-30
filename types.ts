import Discord from 'discord.js';

export interface IMessage extends Discord.Message {
  command: string;
  args: string[];
}

export interface Command {
  execute: Function;
  name: string;
}