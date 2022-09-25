import { MessageOptions, StageChannel, VoiceChannel } from "discord.js";
import MusicPlayer from "../naoko/MusicPlayer.naoko";
import MusicPlayerHandler from "../naoko/MusicPlayerHandler.naoko";
import { IMessage } from "../types";
/**
 * Checks if the message is in a guild, by a member
 * and that member is in a voice channel
 * and gets or creates a music player for that guild
 * @param message the message that did a music command
 * @param next the callback function that leads after this middleware
 * @returns a promise of a string of the error or from the child callback
 * @author Geoxor
 */
export async function musicMiddleware(
  message: IMessage,
  next: (channel: VoiceChannel | StageChannel, player: MusicPlayer) => Promise<MessageOptions | string>
) {
  if (!message.guild) return "Music doesn't work in DMs";
  if (!message.member) return "Couldn't find you lol";

  // Try to get the vc the user is in or the one they mentioned
  let voiceChannel = message.member.voice.channel || message.mentions.channels.first();

  if (!voiceChannel) return "Join or mention a voice chat for me to join in";

  if (voiceChannel!.type !== "GUILD_VOICE" && voiceChannel!.type !== "GUILD_STAGE_VOICE")
    return "That is not a voice/stage channel";

  const player = MusicPlayerHandler.getMusicPlayer(message.guild);
  return next(voiceChannel as VoiceChannel | StageChannel, player);
}
