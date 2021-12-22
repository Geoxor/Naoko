import { defineCommand } from "../types";
import { definePlugin } from "../shaii/Plugin.shaii";
import { objectFlip } from "../logic/logic.shaii";

const MORSE_CODE_TABLE = {
  a: ".-",
  b: "-...",
  c: "-.-.",
  d: "-..",
  e: ".",
  f: "..-.",
  g: "--.",
  h: "....",
  i: "..",
  j: ".---",
  k: "-.-",
  l: ".-..",
  m: "--",
  n: "-.",
  o: "---",
  p: ".--.",
  q: "--.-",
  r: ".-.",
  s: "...",
  t: "-",
  u: "..-",
  v: "...-",
  w: ".--",
  x: "-..-",
  y: "-.--",
  z: "--..",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  "0": "-----",
  " ": "/",
};

/**
 * Encodes an alphanumerical string to Morse code
 * @param {string} string an alphanumerical string to encode
 * @author Geoxor
 */
export function encodeMorse(string: string): string {
  const strippedString = string.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const characterArray = strippedString.split("");
  const morseCharacters = characterArray.map((a: string) => (MORSE_CODE_TABLE as any)[a]);
  return morseCharacters.join(" ").replace("/ / /", "/");
}

/**
 * Decodes Morse code to an alphanumerical string
 * @param {string} string a Morse code string
 * @author Dave69
 */
export function decodeMorse(string: string): string {
  const strippedString = string.replace(/[a-zA-Z0-9]/g, "");
  const characterArray = strippedString.split(" ");
  const morseCharacters = characterArray.map((a: string) => (objectFlip(MORSE_CODE_TABLE) as any)[a]);
  return morseCharacters.join("");
}

export default definePlugin({
  name: "@geoxor/morse-decenc",
  version: "v1.0.0",
  command: [
    defineCommand({
      name: "morse-encode",
      category: "FUN",
      usage: "morse-encode <sentence>",
      aliases: [],
      description: "Encodes a string to morse code",
      requiresProcessing: false,
      execute: async (message) => {
        // Reply if no args
        if (message.args.length === 0) return "Give me a string to encode!";
        let messageContent: string = message.args.join(" ");
        if (messageContent.length / messageContent.replace(/[\-./\s]/g, "").length > 1.5)
          return decodeMorse(messageContent).substring(0, 2000);
        else return encodeMorse(messageContent).substring(0, 2000);
      },
    }),
    defineCommand({
      name: "morse-decode",
      category: "FUN",
      usage: "morse-decode <sentence>",
      aliases: [],
      description: "Decodes morse code",
      requiresProcessing: false,
      execute: async (message) => {
        // Reply if no args
        if (message.args.length === 0) return "Give me a string to decode!";
        return decodeMorse(message.args.join(" ")).substring(0, 2000);
      },
    }),
  ],
});
