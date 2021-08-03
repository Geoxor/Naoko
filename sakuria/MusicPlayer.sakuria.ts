import { AudioPlayerStatus, AudioPlayerState, AudioPlayer, entersState, createAudioPlayer, joinVoiceChannel, VoiceConnectionStatus, NoSubscriberBehavior, createAudioResource, VoiceConnectionState } from "@discordjs/voice";
import Discord from "discord.js";
import { walkDirectory } from "../logic/logic.sakuria";
import config from "./Config.sakuria";
import logger from "./Logger.sakuria";
import fs from 'fs';
/**
 * The MusicPlayer class responsible for handling connection and audio playback in a voice channel
 * @author N1kO23
 */
export default class MusicPlayer {
  private player: AudioPlayer;
  public queue: string[];
  public nowPlaying: string | null;

  constructor() {
    this.player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
    this.player.on("error", (error) => {
      console.error(error);
    });
    this.queue = [];
    this.nowPlaying = null;
    // this.player.on("stateChange", this.onChange("Audio Player"));
  }

  private onChange = (name: string) => (oldState: AudioPlayerState | VoiceConnectionState, newState: AudioPlayerState | VoiceConnectionState) => {
    logger.sakuria.generic(`[${name}]` + ` Changed from ${oldState.status} to ${newState.status}`);
  };

  /**
   * Generates new audioResource from the array
   * @author N1kO23
   */
  private playNextSong(audioArray: string[]) {
    let audio = audioArray[0];
    this.nowPlaying = audio;
    if (this.queue.length !== 0) {
      this.queue.shift();
      logger.sakuria.generic(`Playing ${audio}`);
      return createAudioResource(audio);
    }
  }

  /**
   * Generates new audioResource from the array
   * @author N1kO23
   */
  public async start(voiceChannel: Discord.VoiceChannel | Discord.StageChannel) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      // @ts-ignore
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    connection.on("stateChange", this.onChange("Voice chat"));
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 10e3);
      if (voiceChannel && voiceChannel.type == ("GUILD_STAGE_VOICE" as string) && voiceChannel.guild.me) {
        await voiceChannel.guild.me.voice.setSuppressed(false).catch((error) => console.error(error));
      }
      connection.subscribe(this.player);
    } catch (error) {
      console.error(`[PLAYER HANDLER]` + ` Error with connection: ` + error);
    }
  }

  /**
   * Starts to play the next song in thr queue
   * @author N1kO23
   */
  public skip() {
    const newQueue = this.playNextSong(this.queue);
    if (newQueue) this.player.play(newQueue);
  }

  /**
   * Reads the folder for all the tunes and adds them to the queue
   * @author N1kO23
   */
  public async initQueue() {
    this.queue = await walkDirectory(config.musicDirectory);
    this.skip();
    try {
      // Add the event listener to make the playback continuous as long as queue is not empty
      this.player.on(AudioPlayerStatus.Idle, () => this.skip());
    } catch (error) {
      console.error(`[PLAYER HANDLER] Error with player: ${error}`);
    }
  }

  /**
   * Shuffles the playlist
   * @author N1kO23
   */
  public shuffle() {
    var currentIndex = this.queue.length,
      randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [this.queue[currentIndex], this.queue[randomIndex]] = [this.queue[randomIndex], this.queue[currentIndex]];
    }
    console.log(this.queue);
  }

  /**
   * Returns the current playing song's file path
   * @author N1kO23
   */
  public getNowPlayingFile() {
    return this.nowPlaying;
  }
}
