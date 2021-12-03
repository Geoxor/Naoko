import Waifu from "./Waifu.shaii";
import Discord from "discord.js";
import { IWaifu, IWaifuRarity } from "../types";
import { randomChoice, calcDamage } from "../logic/logic.shaii";
import { COMMON, LEGENDARY, MYTHICAL, RARE, UNCOMMON } from "./WaifuRarities.shaii";
// @ts-ignore
import { db } from "./Database.shaii";

/**
 * This manages a waifu battle, randomly picking enemy waifus,
 * creating threads and deleting them and
 * rewarding players and keeping track of them
 * @author Cimok, Geoxor, azur1s, N1kO23
 */
export default class WaifuBattle {
  private lastBossbarMessage: Discord.Message | null = null;
  public waifu: Waifu;
  public participants: {
    [key: string]: {
      totalAttacks: number;
      totalDamageDealt: number;
      userId: string;
    };
  } = {};
  public thread: Discord.ThreadChannel | null = null;
  public collector: Discord.MessageCollector | null = null;
  public bossbar: NodeJS.Timer | null = null;
  public BATTLE_DURATION: number = 60000;
  public AFTERMATH_TIME: number = 15000;
  public threadName: string;
  public ended: boolean = false;
  public battleStart: number = 0;
  public battleEnd: number = 0;

  public constructor(public startUser: Discord.User, public channel: Discord.TextChannel) {
    const { chosenWaifu, chosenRarity } = this.chooseWaifu([COMMON, UNCOMMON, RARE, LEGENDARY, MYTHICAL]);
    this.waifu = new Waifu(chosenWaifu, chosenRarity);
    this.startUser = startUser;
    this.channel = channel;
    this.threadName = `${this.waifu.emoji} ${this.waifu.rarity} waifu battle!`;
  }

  /**
   * Returns a random waifu based on rarities
   * @returns {Waifu} the waifu JSON
   * @author MaidMarija
   */
  public chooseWaifu(rarities: IWaifuRarity[]): { chosenWaifu: IWaifu; chosenRarity: IWaifuRarity } {
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
  public getWaifu(): Discord.MessageOptions {
    return { content: "type !attack to kill her!", files: [this.waifu.attachment], embeds: [this.waifu.ui] };
  }

  /**
   * Starts the battle
   * @author Geoxor, Cimok
   */
  public async startBattle() {
    // Create thread
    await this.initThread();

    // Update the bossbar every second if it changes
    this.bossbar = setInterval(() => this.updateBossbar(), 5000);

    // End the battle if its been more than the battle duration
    setTimeout(async () => {
      !this.ended && (await this.endBattle());
    }, this.BATTLE_DURATION);
  }

  /**
   * Creates the thread for the battle
   * @author Geoxor, Cimok
   */
  public async initThread() {
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
  public async initCollector() {
    // Create the collector on the thread
    this.collector = new Discord.MessageCollector(this.thread!);

    // Collect messages
    this.collector.on("collect", async (message) => {
      if (message.content === "!attack") {
        // Keep track of when the battle started
        if (this.battleStart == 0) this.battleStart = Date.now();

        // Calculate damage to deal
        const damage = calcDamage();

        // Add the player if they aren't in already
        if (!this.participants[message.author.id]) {
          this.participants[message.author.id] = {
            userId: message.author.id,
            totalAttacks: 0,
            totalDamageDealt: 0,
          };
        }

        // Get the current player attacking
        const player = this.participants[message.author.id];

        // Append their statistics
        player.totalAttacks++;
        player.totalDamageDealt = player.totalDamageDealt + damage;

        // Deal damage to the waifu
        this.waifu.dealDamage(damage);

        // Rare and above waifu can dodge attacks
        // if (Math.random() < 0.9 && relativeFrequency >= 5 ) this.waifu.dealDamage(damage);
        if (this.waifu.isDead) await this.endBattle().catch((error) => console.log(error));
      }
    });
  }

  /**
   * Updates the bossbar with the current battle stats
   * @author Geoxor, Cimok
   */
  public async updateBossbar() {
    const newBossbar = `${this.waifu.name} still has *${~~this.waifu.currentHp}* HP!`;
    if (!this.ended && this.lastBossbarMessage?.content !== newBossbar) {
      this.lastBossbarMessage = await this.thread!.send(newBossbar);
    }
  }

  /**
   * Calculate how long the battle lasted
   * @author N1kO23, Geoxor
   */
  public calculateBATTLE_DURATION() {
    return (this.battleEnd - this.battleStart) / 1000;
  }

  /**
   * The total DPS of the battle
   * @author N1kO23, Geoxor
   */
  public calculateDPS() {
    return this.waifu.maxHp / this.calculateBATTLE_DURATION();
  }

  /**
   * Gets a list of all the participants who took part in the battle
   * Returning their tags and sorted by their DPS
   * @author N1kO23, Geoxor
   */
  public getParticipantsString() {
    const sortedArray = Object.values(this.participants).sort(
      (a, b) => b.totalDamageDealt - a.totalDamageDealt
    );
    return sortedArray
      .map((user) => `<@${user.userId}> - 🩸 DMG ${user.totalDamageDealt} - ⚔️ Attacks ${user.totalAttacks}`)
      .join("\n");
  }

  /**
   * Returns the reward info string for the embed
   * @author N1kO23, Geoxor
   */
  public getRewardString() {
    return `
      💎 Prisms: ${this.waifu.rewards.money}
      ✨ XP: ${this.waifu.rewards.xp}
    `;
  }

  /**
   * Creates the defeat embed to display when the battle ends
   * @author Geoxor
   */
  public createDefeatEmbed() {
    return new Discord.MessageEmbed()
      .setColor("#FF3136")
      .setTitle(`${this.waifu.name} has escaped with ${~~this.waifu.currentHp} HP!`)
      .addField("Participants", this.getParticipantsString(), false)
      .setFooter(
        `${this.calculateBATTLE_DURATION().toFixed(2)} seconds - ${this.calculateDPS().toFixed(2)}DPS`
      );
  }

  /**
   * Creates the reward embed to display when the battle ends
   * @author N1kO23, Geoxor
   */
  public createRewardEmbed() {
    return (
      new Discord.MessageEmbed()
        .setColor("#2F3136")
        .setTitle(`${this.waifu.name} has been defeated!`)
        // .addField("Rewards", this.getRewardString(), false)
        .addField("Participants", this.getParticipantsString(), false)
        .setFooter(
          `${this.calculateBATTLE_DURATION().toFixed(2)} seconds - ${this.calculateDPS().toFixed(2)}DPS`
        )
    );
  }

  /**
   * Rewards all the participating players
   * @author Geoxor
   */
  public async rewardPlayers() {
    for (let [userId, stats] of Object.entries(this.participants)) {
      // Create the new user if they don't exist so we can
      // reward them later
      await db.newUser(userId);
      await db.addBattleRewardsToUser(userId, {
        totalAttacks: stats.totalAttacks,
        totalDamageDealt: stats.totalDamageDealt,
        xp: this.waifu.rewards.xp,
        money: this.waifu.rewards.money,
        rarity: this.waifu.rarity,
      });
    }
  }

  /**
   * Ends the battle
   * @author Geoxor, Cimok
   */
  public async endBattle() {
    if (this.ended) return;
    this.ended = true;
    this.battleEnd = Date.now();
    this.collector!.stop();
    clearInterval(this.bossbar as NodeJS.Timeout);

    if (this.waifu.isDead) {
      await this.thread!.setName(`${this.threadName} victory`);
      await this.thread!.send({
        content: `Battle ended, here's your rewards - deleting thread in ${this.AFTERMATH_TIME / 1000} seconds`,
        embeds: [this.createRewardEmbed()],
      });
      // await this.rewardPlayers();
    } else {
      await this.thread!.setName(`${this.threadName} defeat`);
      await this.thread!.send({
        content: `Battle ended, no one killed the waifu - deleting thread in ${
          this.AFTERMATH_TIME / 1000
        } seconds`,
        embeds: [this.createDefeatEmbed()],
      });
    }

    setTimeout(async () => {
      try {
        this.channel.name === "shaii" ? await this.thread!.setArchived(true) : await this.thread?.delete();
      } catch (error: any) {
        console.log(error);
      }
    }, this.AFTERMATH_TIME);
  }
}
