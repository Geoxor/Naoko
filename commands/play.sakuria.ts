import { VoiceChannel } from "discord.js";
import MusicPlayerHandler from "../sakuria/MusicPlayerHandler.sakuria";
import { IMessage } from "../types";

export default {
  name: "play",
  description: "Play a song",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<string> => {
    if (!message.guild) return "music doesn't work in DMs"
    if (!message.member) return "couldn't find you lol";
    if (!message.member.voice.channel) return "You're not in a voice chat!";
    const musicPlayer = MusicPlayerHandler.getMusicPlayer(message.guild);
    await musicPlayer.create(message.member.voice.channel)
    await musicPlayer.addToQueue();
    return 'Started playing';
  },
};
