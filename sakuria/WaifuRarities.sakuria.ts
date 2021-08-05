import chalk from "chalk";
import fs from "fs";
import { getWaifuNameFromFileName } from "../logic/logic.sakuria";
import { IWaifu, IWaifuRarity, IWaifuRarityName } from "../types";
import logger from "./Logger.sakuria";

function loadWaifusFromRarity(rarity: IWaifuRarityName): IWaifu[] {
  const IWaifus = [];
  const waifuImages = fs.readdirSync(`./assets/waifus/${rarity}`);

  for (let waifu of waifuImages) {
    const name = getWaifuNameFromFileName(waifu);
    IWaifus.push({
      name,
      image: waifu,
    } as IWaifu);
    logger.sakuria.generic(`Parsed ${chalk.hex("#FFCB6B")(rarity.toUpperCase())} waifu ${chalk.green(name)}`);
  }
  return IWaifus;
}

export const COMMON: IWaifuRarity = {
  hp: 1000,
  armor: 0,
  rewards: { xp: 100, money: 200 },
  relativeFrequency: 14,
  name: "common",
  color: "#8F93A2",
  emoji: "👺",
  waifus: loadWaifusFromRarity("common"),
};

export const UNCOMMON: IWaifuRarity = {
  hp: 2500,
  armor: 100,
  rewards: { xp: 250, money: 500 },
  relativeFrequency: 7,
  name: "uncommon",
  color: "#BDDE86",
  emoji: "🐉",
  waifus: loadWaifusFromRarity("uncommon"),
};

export const RARE: IWaifuRarity = {
  hp: 10000,
  armor: 500,
  rewards: { xp: 1000, money: 2000 },
  relativeFrequency: 5,
  name: "rare",
  color: "#C792EA",
  emoji: "🔮",
  waifus: loadWaifusFromRarity("rare"),
};

export const LEGENDARY: IWaifuRarity = {
  hp: 25000,
  armor: 1500,
  rewards: { xp: 2500, money: 5000 },
  relativeFrequency: 3,
  name: "legendary",
  color: "#FFCB6B",
  emoji: "🌟",
  waifus: loadWaifusFromRarity("legendary"),
};

export const MYTHICAL: IWaifuRarity = {
  hp: 50000,
  armor: 2500,
  rewards: { xp: 5000, money: 10000 },
  relativeFrequency: 1,
  name: "mythical",
  color: "#F07178",
  emoji: "⚜️",
  waifus: loadWaifusFromRarity("mythical"),
};
