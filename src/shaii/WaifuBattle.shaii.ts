import Waifu from "./Waifu.shaii";
import Discord from "discord.js";
import { calcDamage, calcParticipated } from "../logic/logic.shaii";
import { User } from "./Database.shaii";

/**
 * This manages a waifu battle, randomly picking enemy waifus,
 * creating threads and deleting them and
 * rewarding players and keeping track of them
 * @author Cimok, Geoxor, azur1s, N1kO23
 */
export default class WaifuBattle {
  private lastBossbarMessage: Discord.Message | null = null;
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

  public constructor(public startUser: Discord.User, public channel: Discord.TextChannel, public waifu: Waifu) {
    this.startUser = startUser;
    this.channel = channel;
    this.threadName = `${this.waifu.emoji} ${this.waifu.name} Battle!`.substring(0, 64);
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
      if (message.content.includes("!attack")) {
        // Keep track of when the battle started
        if (this.battleStart == 0) this.battleStart = Date.now();

        // Calculate damage to deal
        const damage = calcDamage(100, 0.3, 2);

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
    const newBossbar = this.waifu.getHpBar();
    if (!this.ended) {
      this.lastBossbarMessage = await this.thread!.send({
        embeds: [newBossbar],
      });
    }
  }

  /**
   * Calculate how long the battle lasted
   * @author N1kO23, Geoxor
   */
  public calculateBattleDuration() {
    return (this.battleEnd - this.battleStart) / 1000;
  }

  /**
   * The total DPS of the battle
   * @author N1kO23, Geoxor
   */
  public calculateDPS() {
    return this.waifu.maxHp / this.calculateBattleDuration();
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
      .addField("Participants", this.getParticipantsString() || "When the software", false)
      .setFooter(`${this.calculateBattleDuration().toFixed(2)} seconds - ${this.calculateDPS().toFixed(2)}DPS`);
  }

  /**
   * Creates the reward embed to display when the battle ends
   * @author N1kO23, Geoxor
   */
  public createRewardEmbed() {
    return new Discord.MessageEmbed()
      .setColor("#2F3136")
      .setTitle(`${this.waifu.name} has been defeated!`)
      .addField("Rewards", this.getRewardString(), false)
      .addField("Participants", this.getParticipantsString(), false)
      .setFooter(`${this.calculateBattleDuration().toFixed(2)} seconds - ${this.calculateDPS().toFixed(2)}DPS`);
  }

  /**
   * Rewards all the participating players
   * @author Geoxor
   */
  public async rewardPlayers() {
    const participants = Object.entries(this.participants);

    for (let [userId, stats] of participants) {
      // Create the new user if they don't exist so we can
      // reward them later
      const user = await User.findOne({ discord_id: userId });
      if (user) {
        // Calculate how much % of the reward each player gets based on their contribution ratio
        const rewardRatio = calcParticipated(stats.totalDamageDealt, this.waifu.maxHp, participants.length);
        await user.addBattleRewards({
          totalAttacks: stats.totalAttacks,
          totalDamageDealt: stats.totalDamageDealt,
          xp: ~~(this.waifu.rewards.xp * rewardRatio),
          money: ~~(this.waifu.rewards.money * rewardRatio),
          rarity: this.waifu.rarity,
        });
      }
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
      await Promise.all([
        this.thread!.send({
          content: `Battle ended, here's your rewards - deleting thread in ${
            this.AFTERMATH_TIME / 1000
          } seconds`,
          embeds: [this.createRewardEmbed()],
        }),
        this.thread!.setName(`✅ Victory`),
        await this.rewardPlayers(),
      ]);
    } else {
      await Promise.all([
        this.thread!.send({
          content: `Battle ended, no one killed the waifu - deleting thread in ${
            this.AFTERMATH_TIME / 1000
          } seconds`,
          embeds: [this.createDefeatEmbed()],
        }),
        this.thread!.setName(`❌ Defeat`),
      ]);
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
