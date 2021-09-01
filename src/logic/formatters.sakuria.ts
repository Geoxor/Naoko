import morseCodeTable from "../assets/morseCodeTable.json";
import morseCodeTableReverse from "../assets/morseCodeTableReverse.json";

/**
 * Gets the used/total heap in ram used
 * @author Geoxor
 * @pure
 */
export function getCurrentMemoryHeap() {
  const mem = process.memoryUsage();
  const used = mem.heapUsed / 1000 / 1000;
  const total = mem.heapTotal / 1000 / 1000;
  return `${used.toFixed(2)}/${total.toFixed(2)}MB`;
}

/**
 * Convert milliseconds to human readable
 * @param ms miliseconds to convert
 * @author Geoxor
 * @pure
 */
export function msToTime(ms: number) {
  const seconds = ms / 1000;
  const minutes = ms / (1000 * 60);
  const hours = ms / (1000 * 60 * 60);
  const days = ms / (1000 * 60 * 60 * 24);
  if (seconds < 60) return seconds + " sec";
  else if (minutes < 60) return minutes + " min";
  else if (hours < 24) return hours + " hour";
  else return days + " days";
}

/**
 * Combines 2 user's names to create a ship name
 * @param matcher first half of the shipname
 * @param matchee second half of the shiipname
 * @returns {string} the ship name
 * @author Geoxor
 * @pure
 */
export function getShipName(matcher: string, matchee: string) {
  return matcher.substring(0, matcher.length >> 1) + matchee.substring(matchee.length >> 1);
}

/**
 * Encodes an alphanumerical string to Morse code
 * @param {string} string an alphanumerical string to encode
 * @author Geoxor
 * @pure
 */
export function encodeMorse(string: string): string {
  const strippedString = string.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const characterArray = strippedString.split("");
  const morseCharacters = characterArray.map((a: string) => (morseCodeTable as any)[a]);
  return morseCharacters.join(" ").replace("/ / /", "/");
}

/**
 * Decodes Morse code to an alphanumerical string
 * @param {string} string a Morse code string
 * @author Dave69
 * @pure
 */
export function decodeMorse(string: string): string {
  const strippedString = string.replace(/[a-zA-Z0-9]/g, "");
  const characterArray = strippedString.split(" ");
  const morseCharacters = characterArray.map((a: string) => (morseCodeTableReverse as any)[a]);
  return morseCharacters.join("");
}

/**
 * Capitalizes the first character of a string
 * @param string the string to capitalize
 * @author Bluskript
 * @pure
 */
export function capitalizeFirstLetter(string: string) {
  const result = [];
  const words = string.split(" ");
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    result.push(word.charAt(0).toUpperCase() + word.slice(1));
  }
  return result.join(" ");
}

/**
 * Uwu-ify sentences
 * @param {string} sentence the sentence to uwu-ify
 * @author azur1s
 * @pure
 */
export function uwufy(sentence: string): string {
  return sentence
    .replace(/(?:r|l)/g, "w")
    .replace(/(?:R|L)/g, "W")
    .replace(/u/g, "oo")
    .replace(/U/g, "OO")
    .replace(/n([aeiou])/g, "ny$1")
    .replace(/N([AEIOU])/g, "NY$1")
    .replace(/ove/g, "uv")
    .split(" ")
    .map((val) => {
      return Math.random() < 0.1 ? `${val.charAt(0)}-${val}` : `${val}`;
    })
    .join(" ");
}

/**
 * Britishize a sentence
 * @param sentence the sentence to britishize
 * @author Geoxor & MaidMarija
 * @pure
 */
export function britify(sentence: string): string {
  // first delete any disgusting american dialect (IMPORTANT, NEEDS IMPROVEMENT)
  return (
    sentence
      .replace(/mom/g, "mum")
      // and make some suitable other word replacements
      .replace(/what/g, "wot")
      // personally "what the fuck mate" sounds better than "what the fuck cunt"
      .replace(/man|bud(dy)?|bro/g, "mate")
      // we don't use t (sometimes) nor the -ing suffix
      .replace(/(?<!\s|k|x|')t+(?!(\w*')|h|ch|ion)|(?<=\win)g/g, "'")
  );
}
