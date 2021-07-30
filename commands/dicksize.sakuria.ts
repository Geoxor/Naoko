import { IMessage } from "../types";
import Discord from 'discord.js';

export const command = {
  name: "dicksize",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<string | Discord.ReplyMessageOptions> => {
    const dicksize = ~~(Math.random() * 31) + 1;
    return `8${'='.repeat(dicksize)}D ${dicksize}cm`;
  }
}