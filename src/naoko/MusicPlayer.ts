import {
  AudioPlayer,
  AudioPlayerState,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnectionState,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import Discord from "discord.js";
import fs from "fs";
import getColors from "get-image-colors";
import Jimp from "jimp";
import * as mm from "music-metadata";
import { walkDirectory } from "../logic/logic";
import { config } from "./Config";
import { logger } from "./Logger";

/**
 * The MusicPlayer class responsible for handling connection and audio playback in a voice channel
 * @author N1kO23
 */
export default class MusicPlayer {
  private player: AudioPlayer;
  public queue: string[];
  public nowPlayingFile: string | null;
  public nowPlayingStream: AudioResource | null = null;

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
    this.nowPlayingFile = null;
    // this.player.on("stateChange", this.onChange("Audio Player"));
  }

  private onChange =
    (name: string) =>
      (oldState: AudioPlayerState | VoiceConnectionState, newState: AudioPlayerState | VoiceConnectionState) => {
        logger.print(`[${name}]` + ` Changed from ${oldState.status} to ${newState.status}`);
      };

  /**
   * Generates new audioResource from the array
   * @author N1kO23
   */
  private playNextSong(audioArray: string[]) {
    let audio = audioArray[0];
    this.nowPlayingFile = audio;
    if (this.queue.length !== 0) {
      this.queue.shift();
      logger.print(`Playing ${audio}`);
      return createAudioResource(audio, { inlineVolume: true });
    }
  }

  /**
   * Resizes a cover art for sending to Discord
   * @param cover the cover to resize
   * @returns
   */
  private async resizeCover(cover: Buffer, size: number = 300): Promise<Buffer> {
    const image = await Jimp.read(cover);
    return image.resize(Jimp.AUTO, size).getBufferAsync("image/jpeg");
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
    } catch (error: any) {
      console.error(`[PLAYER HANDLER]` + ` Error with connection: ` + error);
    }
  }

  /**
   * Starts to play the next song in thr queue
   * @author N1kO23
   */
  public skip() {
    const newStream = this.playNextSong(this.queue);
    if (newStream) {
      this.nowPlayingStream = newStream;
      this.player.play(this.nowPlayingStream);
    }
  }

  /**
   * Changes the volume of a player
   * @param volume the volume to set it to
   * @author Geoxor
   */
  public changeVolume(volume: number = 1) {
    if (!this.nowPlayingStream) return "There's nothing playing currently";
    this.nowPlayingStream.volume?.setVolume(volume);
  }

  /**
   * Reads the folder for all the tunes and adds them to the queue
   * @author N1kO23
   */
  public async initQueue() {
    this.queue = await walkDirectory(config.musicDirectory);
    this.shuffle();
    this.skip();
    try {
      // Add the event listener to make the playback continuous as long as queue is not empty
      this.player.on(AudioPlayerStatus.Idle, () => this.skip());
    } catch (error: any) {
      console.error(`[PLAYER HANDLER] Error with player: ${error}`);
    }
  }

  /**
   * Shuffles the playlist
   * @author N1kO23
   */
  public shuffle() {
    let currentIndex = this.queue.length,
      randomIndex;
    while (0 !== currentIndex) {
      randomIndex = ~~(Math.random() * currentIndex);
      currentIndex--;
      [this.queue[currentIndex], this.queue[randomIndex]] = [this.queue[randomIndex], this.queue[currentIndex]];
    }
  }

  /**
   * Returns the metadata of a tune
   * @author Geoxor
   */
  public async getMetadata(file: string) {
    try {
      return await mm.parseFile(file);
    } catch (error: any) {
      console.error(error);
    }
  }

  /**
   * Creates an embed to send for the currently playing tune
   * @author Geoxor
   */
  public async createNowPlayingEmbed(mini: boolean = false) {
    // If there is nothing playing return
    if (!this.nowPlayingFile) return "Nothing is playing currently";

    // Get information about the song
    const metadata = await this.getMetadata(this.nowPlayingFile);

    // If we fail to get any metadata return
    if (!metadata) return this.nowPlayingFile;

    // Get the data we want from the metadata
    const { codec, bitsPerSample, sampleRate, bitrate } = metadata.format;
    const { artist, title, album, date } = metadata.common;

    // Prepare an embed to send to the user
    const embed = new Discord.MessageEmbed().addField("Codec", codec || "Unknown", true);

    // Add fields if the embed is a mini one or not
    mini
      ? embed.setThumbnail("attachment://cover.png")
      : embed
        .setImage("attachment://cover.png")
        .addField("Title", title || "Unknown", true)
        .addField("Album", album || "Unknown", true)
        .addField("Samplerate", `${sampleRate}Hz` || "Unknown", true)
        .addField("Date", date || "Unknown", true);

    // Add these if they exist
    artist && title ? embed.setTitle(`${artist} - ${title}`) : embed.setTitle(this.nowPlayingFile);
    bitsPerSample && embed.addField("Sample Bits", `${bitsPerSample}bits`, true);
    bitrate && embed.addField("Bitrate", `${~~(bitrate / 1000)}Kbps`, true);

    // Get the cover art
    const coverBuffer = metadata.common.picture?.[0].data;
    const coverFormat = metadata.common.picture?.[0].format;
    if (coverBuffer && coverFormat) {
      const coverColor = (await getColors(coverBuffer, coverFormat))[0].hex();
      const resizedCoverBuffer = await this.resizeCover(coverBuffer, mini ? 128 : 300);
      const coverAttachment = new Discord.MessageAttachment(resizedCoverBuffer, "cover.png");
      embed.setColor(coverColor as Discord.HexColorString);
      return { embeds: [embed], files: [coverAttachment] };
    }

    // If there's no cover art just return the generic cover art
    const genericCover = fs.createReadStream("./src/assets/images/defaultCover.png");
    const coverAttachment = new Discord.MessageAttachment(genericCover, "cover.png");
    embed.setColor("#cacaca");
    return { embeds: [embed], files: [coverAttachment] };
  }
}
