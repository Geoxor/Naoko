// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import gifenc from "gifenc";
import Jimp from "jimp";
import { logger } from "../naoko/Logger";

export function timeSince(date: number) {
  const seconds = ~~((Date.now() - date) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) return ~~interval + " y";
  interval = seconds / 2592000;

  if (interval > 1) return ~~interval + " mo";
  interval = seconds / 86400;

  if (interval > 1) return ~~interval + " d";
  interval = seconds / 3600;

  if (interval > 1) return ~~interval + " h";
  interval = seconds / 60;

  if (interval > 1) return ~~interval + " min";
  return ~~seconds + " s";
}

export function durationToMilliseconds(duration: string): string {
  const [digits, abbr] = duration.match(/\d{1,3}|\D/g) as string[];
  switch (abbr) {
    case "s":
    case "S":
      return (parseInt(digits) * 1000).toString();
    case "m":
    case "M":
      return (parseInt(digits) * 60 * 1000).toString();
    case "h":
    case "H":
      return (parseInt(digits) * 3600 * 1000).toString();
    case "d":
    case "D":
      return (parseInt(digits) * 86400 * 1000).toString();
    case "w":
    case "W":
      return (parseInt(digits) * 604800 * 1000).toString();
    case "t": // t stands for month since m is already taken for minutes
    case "T":
      return (parseInt(digits) * 2592000 * 1000).toString();
    case "y":
    case "Y":
      return (parseInt(digits) * 31536000 * 1000).toString();
    default:
      logger.error("Invalid duration");
      return "";
  }
}

/**
 * Convert milliseconds to human readable
 * @param ms miliseconds to convert
 * @author Geoxor
 */
export function msToTime(ms: number) {
  const seconds = ms / 1000;
  const minutes = ms / (1000 * 60);
  const hours = ms / (1000 * 60 * 60);
  const days = ms / (1000 * 60 * 60 * 24);
  if (seconds < 60) return seconds.toFixed(2) + " sec";
  else if (minutes < 60) return minutes.toFixed(2) + " min";
  else if (hours < 24) return hours.toFixed(2) + " hour";
  else return days.toFixed(2) + " days";
}

/**
 * Convert milliseconds to a human readable string, example: 2 years, 67 days, 20 hours, 2 minutes, 24 seconds
 * @param ms milliseconds to convert
 */
export function msToFullTime(ms: number): string {
  const seconds = Number(ms / 1000);
  const y = ~~(seconds / (3600 * 24 * 365));
  const d = ~~((seconds / (3600 * 24)) % 365);
  const h = ~~((seconds % (3600 * 24)) / 3600);
  const m = ~~((seconds % 3600) / 60);
  const s = ~~(seconds % 60);

  const yDisplay = y > 0 && d > 0 ? y + (y === 1 ? " year, " : " years, ") : "";
  const dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
  const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
  const mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
  const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "0 seconds";
  return yDisplay + dDisplay + hDisplay + mDisplay + sDisplay;
}

/**
 * Picks a random item from an array
 * @author MaidMarija
 */
export function randomChoice<T>(l: Array<T>): T {
  return l[~~(Math.random() * l.length)];
}

