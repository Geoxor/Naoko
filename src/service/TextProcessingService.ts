import { singleton } from "tsyringe";
import { Awaitable } from "discord.js";

type TextProcessingFunction = (sentence: string) => Awaitable<string>;

@singleton()
export default class TextProcessingService {
  private functions: Record<string, TextProcessingFunction>;

  constructor() {
    // Create a hashmap with all TextFunctions for the textify method
    this.functions = {
      brainfuck: this.brainfuck.bind(this),
      britify: this.britify.bind(this),
      spongify: this.spongify.bind(this),
      uwufy: this.uwufy.bind(this),
    };
  }

  isTextProcessor(name: string): boolean {
    return this.functions[name] !== undefined;
  }

  async textify(pipeline: string[], sentence: string) {
    const functions: TextProcessingFunction[] = [];
    for (const name of pipeline) {
      if (this.functions[name]) {
        functions.push(this.functions[name]);
      }
    }

    let fuckedSentence = sentence;
    for (const textFunction of functions) {
      // Use setImmediate to not block the main thread when a bigger text pipeline is used
      fuckedSentence = await new Promise((resolve) => {
        setImmediate(async () => {
          resolve(await textFunction(fuckedSentence));
        });
      });
    }

    return fuckedSentence;
  }

  brainfuck(sentence: string) {
    function closest(num: number, arr: number[]): number {
      const arr2: number[] = arr.map((n: number) => Math.abs(num - n));
      const min: number = Math.min.apply(null, arr2);
      return arr[arr2.indexOf(min)];
    }

    function buildBaseTable(arr: number[]): string {
      const out = { value: "", append: (txt: string) => (out.value += txt) };
      out.append("+".repeat(10));
      out.append("[");
      arr.forEach((cc: number) => {
        out.append(">");
        out.append("+".repeat(cc / 10));
      });
      out.append("<".repeat(arr.length));
      out.append("-");

      out.append("]");
      return out.value;
    }

    const output = { value: "", append: (txt: string) => (output.value += txt) };

    const charArray: number[] = sentence.split("").map((c) => c.charCodeAt(0));
    const baseTable: number[] = charArray
      .map((c: number) => Math.round(c / 10) * 10)
      .filter((i: number, p: number, s: number[]) => s.indexOf(i) === p);

    output.append(buildBaseTable(baseTable));

    let pos: number = -1;
    for (let i = 0; i < charArray.length; i++) {
      const bestNum: number = closest(charArray[i], baseTable);
      const bestPos: number = baseTable.indexOf(bestNum);

      const moveChar: string = pos < bestPos ? ">" : "<";
      output.append(moveChar.repeat(Math.abs(pos - bestPos)));
      pos = bestPos;

      const opChar: string = baseTable[pos] < charArray[i] ? "+" : "-";
      output.append(opChar.repeat(Math.abs(baseTable[pos] - charArray[i])));
      output.append(".");
      baseTable[pos] = charArray[i];
    }

    return output.value;
  }

  britify(sentence: string) {
    // first delete any disgusting american dialect (IMPORTANT, NEEDS IMPROVEMENT)
    sentence = sentence.replace(/mom/g, "mum");

    // and make some suitable other word replacements
    sentence = sentence.replace(/what/g, "wot");

    // personally "what the fuck mate" sounds better than "what the fuck cunt"
    sentence = sentence.replace(/man|bud(dy)?|bro|fam/g, "mate");

    // we don't use t (sometimes) nor the -ing suffix
    sentence = sentence.replace(/(?<!\s|k|x|')t+(?!(\w*')|h|ch|ion)|(?<=\win)g/g, "'");

    return sentence;
  }

  spongify(sentence: string) {
    var newSentence = "";
    var lastNotSpaceChar;

    // Choose random if odd or even character should be uppercased
    Math.random() > 0.5 ? (newSentence += sentence[0].toUpperCase()) : (newSentence += sentence[0].toLowerCase());

    // upper one character out of 2
    for (let i = 1; i < sentence.length; i++) {
      sentence[i - 1] === " " ? (lastNotSpaceChar = newSentence[i - 2]) : (lastNotSpaceChar = newSentence[i - 1]);
      lastNotSpaceChar === lastNotSpaceChar.toUpperCase()
        ? (newSentence += sentence[i].toLowerCase())
        : (newSentence += sentence[i].toUpperCase());
    }

    return newSentence;
  }

  uwufy(sentence: string) {
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
}
