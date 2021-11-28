import chalk from "chalk";
import fs from "fs";
import { getWaifuNameFromFileName, calcSpread } from "../logic/logic.shaii";
import { IWaifu, IWaifuRarity, IWaifuRarityName } from "../types";
import logger from "./Logger.shaii";

function loadWaifusFromRarity(rarity: IWaifuRarityName): IWaifu[] {
  const IWaifus = [];
  const waifuImages = fs.readdirSync(`./src/assets/waifus/${rarity}`);

  for (let waifu of waifuImages) {
    const name = getWaifuNameFromFileName(waifu);
    IWaifus.push({
      name,
      image: waifu,
    } as IWaifu);
    logger.shaii.generic(`Parsed ${chalk.hex("#FFCB6B")(rarity.toUpperCase())} waifu ${chalk.green(name)}`);
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
