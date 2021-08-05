import Waifu from "./Waifu.sakuria";
import Discord from "discord.js";
import { IWaifu, IWaifuRarity } from "../types";
import { randomChoice, calcDamage } from "../logic/logic.sakuria";
import { COMMON, LEGENDARY, MYTHICAL, RARE, UNCOMMON } from "./WaifuRarities.sakuria";

/**
 * This manages a waifu battle, randomly picking enemy waifus,
 * creating threads and deleting them and
 * rewarding players and keeping track of them
 * @author Cimok, Geoxor, azur1s, N1kO23
 */
export default class WaifuBattle {
  private lastBossbarMessage: Discord.Message | null;
  public waifu: Waifu;
  public participants: Discord.User[];
  public startUser: Discord.User;
  public channel: Discord.TextChannel;
  public thread: Discord.ThreadChannel | null;
  public collector: Discord.MessageCollector | null;
  public bossbar: NodeJS.Timer | null;
  public battleDuration: number;
  public aftermathTime: number;
  public threadName: string;
  public ended: boolean;
  public battleStart: number;
  public battleEnd: number;

  constructor(startUser: Discord.User, channel: Discord.TextChannel) {
    const { chosenWaifu, chosenRarity } = this.chooseWaifu([COMMON, UNCOMMON, RARE, LEGENDARY, MYTHICAL]);
    this.waifu = new Waifu(chosenWaifu, chosenRarity);
    this.participants = [];
    this.startUser = startUser;
    this.channel = channel;
    this.bossbar = null;
    this.thread = null;
    this.collector = null;
    this.battleDuration = 60000;
    this.aftermathTime = 20000;
    this.threadName = `waifu battle!`;
    this.ended = false;
    this.lastBossbarMessage = null;
    this.battleStart = 0;
    this.battleEnd = 0;
  }

  /**
   * Returns a random waifu based on rarities
   * @returns {Waifu} the waifu JSON
   * @author MaidMarija
   */
  chooseWaifu(rarities: IWaifuRarity[]): { chosenWaifu: IWaifu; chosenRarity: IWaifuRarity } {
    // sum up all these relative frequencies to generate a maximum for our random number generation
    let maximum = 0;
    rarities.forEach((w) => (maximum += w.relativeFrequency));

    let choiceValue = Math.random() * maximum;

    // next we iterate through our rarities to determine which this choice refers to
    // we use < instead of <= because Math.random() is in the range [0,1)
    for (let rarity of rarities) {
      if (choiceValue < rarity.relativeFrequency) {
        // This is kinda dumb it returns the entire rarity which contains the entire array of waifus as well
        // performance--;
        rarity.waifus = [];
        return { chosenWaifu: randomChoice<IWaifu>(rarity.waifus), chosenRarity: rarity };
      } else {
        choiceValue -= rarity.relativeFrequency;
      }
    }

    // If for some reason we can't get a waifu just return a common one
    return { chosenWaifu: randomChoice<IWaifu>(rarities[0].waifus), chosenRarity: rarities[0] };
  }

  /**
   * Returns the waifu embed
   * @returns {Discord.MessageOptions} of the waifu
   * @author Geoxor, Cimok
   */
  getWaifu(): Discord.MessageOptions {
    return { content: "type !attack to kill her!", files: [this.waifu.attachment], embeds: [this.waifu.ui] };
  }

  /**
   * Starts the battle
   * @author Geoxor, Cimok
   */
  async startBattle() {
    // Create thread
    await this.initThread();

    // Update the bossbar every second if it changes
    this.bossbar = setInterval(() => this.updateBossbar(), 5000);

    // End the battle if its been more than the battle duration
    setTimeout(async () => {
      !this.ended && (await this.endBattle());
    }, this.battleDuration);
  }

  /**
   * Creates the thread for the battle
   * @author Geoxor, Cimok
   */
  async initThread() {
    this.thread = await this.channel.threads.create({
      name: this.threadName,
      autoArchiveDuration: 60,
    });

    await this.thread.join();
    await this.thread.members.add(this.startUser);
    await this.thread.send(this.getWaifu());
    this.initCollector();
  }

  /**
   * Initializes the message collector
   * @author Geoxor, Cimok
   */
  async initCollector() {
    // Create the collector on the thread
    this.collector = new Discord.MessageCollector(this.thread!);

    // Collect messages
    this.collector.on("collect", async (message) => {
      if (message.content === "!attack") {
        // Keep track of when the battle started
        if (this.battleStart == 0) this.battleStart = Date.now();

        // Add the user to the participants who participated
        // in the battle so we can reward them
        !this.participants.includes(message.author) && this.participants.push(message.author);

        this.waifu.dealDamage(calcDamage());
        if (this.waifu.isDead) await this.endBattle();
      }
    });
  }

  /**
   * Updates the bossbar with the current battle stats
   * @author Geoxor, Cimok
   */
  async updateBossbar() {
    const newBossbar = `${this.waifu.name} still has *${this.waifu.currentHp}* HP!`;
    if (!this.ended && this.lastBossbarMessage?.content !== newBossbar) {
      this.lastBossbarMessage = await this.thread!.send(newBossbar);
    }
  }

  /**
   * Calculate how long the battle lasted
   * @author N1kO23, Geoxor
   */
  calculateBattleDuration() {
    return (this.battleEnd - this.battleStart) / 1000;
  }

  /**
   * The total DPS of the battle
   * @author N1kO23, Geoxor
   */
  calculateDPS() {
    return this.waifu.maxHp / this.calculateBattleDuration();
  }

  /**
   * Gets a list of all the participants who took part in the battle
   * Returning their tags and sorted by their DPS
   * @author N1kO23, Geoxor
   */
  getParticipants() {
    return this.participants.map((user) => `<@${user.id}>`).join("\n");
  }

  /**
   * Returns the reward info string for the embed
   * @author N1kO23, Geoxor
   */
  getRewards() {
    return `
      Prisms: ${this.waifu.rewards.money}
      XP: ${this.waifu.rewards.xp}
    `;
  }

  /**
   * Creates the reward embed to display when the battle ends
   * @author N1kO23, Geoxor
   */
  createRewardEmbed() {
    return new Discord.MessageEmbed()
      .setColor("#2F3136")
      .setTitle(`${this.waifu.name} has been defeated!`)
      .addField("Rewards", this.getRewards(), false)
      .addField("Participants", this.getParticipants(), false)
      .setFooter(`${this.calculateBattleDuration().toFixed(2)} seconds - ${this.calculateDPS().toFixed(2)}DPS`);
  }

  /**
   * Ends the battle
   * @author Geoxor, Cimok
   */
  async endBattle() {
    if (this.ended) return;
    this.ended = true;
    this.battleEnd = Date.now();
    this.collector!.stop();
    clearInterval(this.bossbar as NodeJS.Timeout);
    await this.thread!.setName(`${this.threadName} victory`);
    await this.thread!.send({
      content: `Battle ended, here's your rewards - deleting thread in ${this.aftermathTime / 1000} seconds`,
      embeds: [this.createRewardEmbed()],
    });
    setTimeout(() => {
      try {
        this.thread?.delete();
      } catch (error) {
        console.log(error);
      }
    }, this.aftermathTime);
  }
}
