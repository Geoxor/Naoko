import Discord, { Collection } from "discord.js";
import MusicPlayer from "./MusicPlayer.sakuria";

class MusicPlayerHandler {
  private collection: Collection<string, MusicPlayer>;

  constructor() {
    this.collection = new Collection();
  }

  public getMusicPlayer(guild: Discord.Guild): MusicPlayer {

    // Check if theres an existing instance already
    const musicPlayerInstance = this.collection.get(guild.id);

    // If it does exist then return it
    if(musicPlayerInstance) return musicPlayerInstance;

    // Otherwise create a new instance
    const newMusicPlayerInstance = new MusicPlayer();

    // Set it to that guild
    this.collection.set(guild.id, newMusicPlayerInstance);

    // Return it
    return newMusicPlayerInstance;
  }
}

export default new MusicPlayerHandler();