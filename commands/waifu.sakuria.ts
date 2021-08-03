import Waifu from "../sakuria/Waifight.sakuria";
import Discord from "discord.js";
import waifus from "../assets/waifus.json";
import { IMessage, IWaifu } from "../types";

class WaifuBattle {
  public chosenWaifu: IWaifu;
  public waifu: Waifu
  public participants: Discord.GuildMember[];
  public channel: Discord.TextChannel;
  public thread: Discord.ThreadChannel | null;
  public bossbar: NodeJS.Timer | null;

  constructor(channel: Discord.TextChannel){
    this.chosenWaifu = waifus[~~(Math.random() * waifus.length - 1)];
    this.waifu = new Waifu(this.chosenWaifu);
    this.participants = [];
    this.channel = channel;
    this.bossbar = null;
    this.thread = null;
  }

  getWaifu(){
    return {files: [this.waifu.attachment], embeds: [this.waifu.ui]};
  };

  async startBattle(){
    const initialThreadName =`⚔️ ${this.waifu.name} battle!`;
    this.thread = await this.channel.threads.create({
      name: initialThreadName,
      autoArchiveDuration: 60
    });

    await this.thread.join();
    await this.thread.send(this.getWaifu());

    this.bossbar = setInterval(() => this.thread?.setName(`${initialThreadName} (${this.waifu.hp}hp)`), 5000);

    setTimeout(async () => await this.endBattle(), 60000);
  };

  async endBattle(){
    await this.thread?.send("Battle has ended - deleting thread in 10 seconds");
    clearInterval(this.bossbar as NodeJS.Timeout);
    setTimeout(() => this.thread?.setArchived(true), 10000);
  }
}

export default {
  name: "waifu",
  description: "Waifu battle a random waifu with your friends for rewards!",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<Discord.MessageOptions | string> => {
    if (!(message.channel instanceof Discord.TextChannel)) return "Can't start battles in here!"
    const battle = new WaifuBattle(message.channel);
    await battle.startBattle();
    return 'battle started!';
  },
};
