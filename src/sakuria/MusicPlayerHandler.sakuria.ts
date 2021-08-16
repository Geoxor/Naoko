import Discord, { Collection } from "discord.js";
import MusicPlayer from "./MusicPlayer.sakuria";

/**
 * Handles all the music players for each guild
 * @author N1kO23, Geoxor
 */
class MusicPlayerHandler {
  private collection: Collection<string, MusicPlayer>;

  constructor() {
    this.collection = new Collection();
  }

  /**
   * Gets a guild's music player, if there isn't one it
   * will create a new instance for that guild and return it
   * @param guild the discord guild to get the player of
   * @returns {MusicPlayer} the music player for that guild
   */
  public getMusicPlayer(guild: Discord.Guild): MusicPlayer {
    // Check if theres an existing instance already
    const musicPlayerInstance = this.collection.get(guild.id);

    // If it does exist then return it
    if (musicPlayerInstance) return musicPlayerInstance;

    // Otherwise create a new instance
    const newMusicPlayerInstance = new MusicPlayer();

    // Set it to that guild
    this.collection.set(guild.id, newMusicPlayerInstance);

    // Return it
    return newMusicPlayerInstance;
  }
}

export default new MusicPlayerHandler();
