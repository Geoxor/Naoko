//requiring path and fs modules
import { AudioPlayerStatus, AudioResource, AudioPlayerState, AudioPlayer, entersState, createAudioPlayer, joinVoiceChannel, VoiceConnectionStatus, NoSubscriberBehavior, createAudioResource, VoiceConnectionState } from "@discordjs/voice";
import Discord from "discord.js";
import path from "path";
import fs from "fs";
import { walkDirectory } from "../logic/logic.sakuria";

/**
 * The PlayerHandler class responsible for handling connection and audio playback in a voice channel
 * @author N1kO23
 */
module.exports = class PlayerHandler {
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
    this.player.on("stateChange", this.onChange("Audio Player"));
  }

  private onChange = (name: string) => (oldState: AudioPlayerState | VoiceConnectionState, newState: AudioPlayerState | VoiceConnectionState) => {
    console.log(`[${name}]` + ` Changed from ${oldState.status} to ${newState.status}`);
  };

  /**
   * Generates new audioResource from the array
   * @author N1kO23
   */
  private generateAudioResource(audioArray: string[]) {
    let audio = audioArray[0];
    this.nowPlaying = audio;
    if (this.queue.length !== 0) {
      this.queue.shift();
      return createAudioResource(audio);
    }
  }

  /**
   * Generates new audioResource from the array
   * @author N1kO23
   */
  public async create(voiceChannel: Discord.VoiceChannel) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      // @ts-ignore
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    connection.on("stateChange", this.onChange("Voice chat"));
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 10e3);
      // @TODO: Make the bot detect if channel is stage or not and if true -> setSuppressed(false)
      //
      // if(voiceChannel && voiceChannel.type == 'stage') {
      //   await voiceChannel.guild.me.voice.setSuppressed(false).catch(error => console.error(error));
      // }
      connection.subscribe(this.player);
    } catch (error) {
      console.error(`[PLAYER HANDLER]` + ` Error with connection: ` + error);
    }
  }

  /**
   * Starts to play the next song in thr queue
   * @author N1kO23
   */
  public nextSong() {
    const newQueue = this.generateAudioResource(this.queue);
    if (newQueue) this.player.play(newQueue);
  }

  /**
   * Reads the folder for all the tunes and adds them to the queue
   * @author N1kO23
   */
  public async addToQueue() {
    this.queue = await walkDirectory(require("../config.json").musicDirectory);
    this.nextSong();
    try {
      // Add the event listener to make the playback continuous as long as queue is not empty
      this.player.on(AudioPlayerStatus.Idle, () => this.nextSong());
    } catch (error) {
      console.error(`[PLAYER HANDLER]` + ` Error with player: ` + error);
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
};
