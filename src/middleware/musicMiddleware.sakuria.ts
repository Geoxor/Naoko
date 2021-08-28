import { CommandInteraction, GuildMember, MessageOptions, StageChannel, VoiceChannel } from "discord.js";
import MusicPlayer from "../sakuria/MusicPlayer.sakuria";
import MusicPlayerHandler from "../sakuria/MusicPlayerHandler.sakuria";
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
  interaction: CommandInteraction,
  next: (channel: VoiceChannel | StageChannel, player: MusicPlayer) => Promise<MessageOptions | string>
) {
  if (!interaction.guild) return "music doesn't work in DMs";
  const member = interaction.member as GuildMember;

  if (!member) return "couldn't find you lol";
  if (!member.voice.channel) return "You're not in a voice chat!";

  const player = MusicPlayerHandler.getMusicPlayer(interaction.guild);
  return next(member.voice.channel, player);
}

