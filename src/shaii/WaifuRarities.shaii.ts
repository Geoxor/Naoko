import chalk from "chalk";
import fs from "fs";
import { calcSpread, getWaifuNameFromFileName, randomChoice } from "../logic/logic.shaii";
import { IWaifu, IWaifuRarity, IWaifuRarityName } from "../types";
import logger from "./Logger.shaii";

export function loadWaifusFromRarity(rarity: IWaifuRarityName): IWaifu[] {
  const IWaifus = [];
  const waifuImages = fs.readdirSync(`./src/assets/waifus/${rarity}`);

  for (let waifu of waifuImages) {
    const name = getWaifuNameFromFileName(waifu);
    IWaifus.push({
      name,
      image: waifu,
    } as IWaifu);
    logger.print(`Parsed ${chalk.hex("#FFCB6B")(rarity.toUpperCase())} waifu ${chalk.green(name)}`);
  }
  return IWaifus;
}

export const COMMON: IWaifuRarity = {
  hp: calcSpread(1000),
  armor: 0,
  rewards: { xp: calcSpread(100), money: calcSpread(200) },
  relativeFrequency: 10,
  name: "common",
  color: "#8F93A2",
  emoji: "👺",
  waifus: loadWaifusFromRarity("common"),
};

export const UNCOMMON: IWaifuRarity = {
  hp: calcSpread(2500),
  armor: calcSpread(100),
  rewards: { xp: calcSpread(250), money: calcSpread(500) },
  relativeFrequency: 7,
  name: "uncommon",
  color: "#BDDE86",
  emoji: "🐉",
  waifus: loadWaifusFromRarity("uncommon"),
};

export const RARE: IWaifuRarity = {
  hp: calcSpread(10000),
  armor: calcSpread(500),
  rewards: { xp: calcSpread(1000), money: calcSpread(2000) },
  relativeFrequency: 5,
  name: "rare",
  color: "#C792EA",
  emoji: "🔮",
  waifus: loadWaifusFromRarity("rare"),
};

export const LEGENDARY: IWaifuRarity = {
  hp: calcSpread(25000),
  armor: calcSpread(1500),
  rewards: { xp: calcSpread(2500), money: calcSpread(5000) },
  relativeFrequency: 2,
  name: "legendary",
  color: "#FFCB6B",
  emoji: "🌟",
  waifus: loadWaifusFromRarity("legendary"),
};

export const MYTHICAL: IWaifuRarity = {
  hp: calcSpread(50000),
  armor: calcSpread(2500),
  rewards: { xp: calcSpread(5000), money: calcSpread(10000) },
  relativeFrequency: 1,
  name: "mythical",
  color: "#F07178",
  emoji: "⚜️",
  waifus: loadWaifusFromRarity("mythical"),
};

const rarities = [COMMON, UNCOMMON, RARE, LEGENDARY, MYTHICAL];

/**
 * Returns a random waifu based on rarities
 * @returns {Waifu} the waifu JSON
 * @author MaidMarija
 */
export function chooseWaifu(): { chosenWaifu: IWaifu; chosenRarity: IWaifuRarity } {
  // sum up all these relative frequencies to generate a maximum for our random number generation
  let maximum = 0;
  rarities.forEach(w => (maximum += w.relativeFrequency));

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
 * Returns a waifu from string
 * @param name the waifu name
 * @returns {Waifu} the waifu JSON
 * @author Geoxor, azur1s
 */
export async function rigChooseWaifu(
  name: string
): Promise<{ chosenWaifu: IWaifu; chosenRarity: IWaifuRarity } | undefined> {
  for (const rarity of Object.values(rarities)) {
    const searchResult = rarity.waifus.find(waifu => waifu.name.toLowerCase().includes(name.toLowerCase()));
    if (searchResult) {
      return { chosenWaifu: searchResult, chosenRarity: rarity };
    }
  }
}
