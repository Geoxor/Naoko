import { TextProcessors } from "../types";

import logger from "../shaii/Logger.shaii";
import { textToBrainfuck, textToBritify, textToSpongify, textToUwufy } from "./logic.shaii";

export const textProcessors: TextProcessors = {
  brainfuck,
  britify,
  spongify,
  uwufy,
};

/**
 * @param pipeline the order of functions to apply
 * @param sentence the sentence to start with
 * @returns {string} the modified sentence
 * @author Qexat & Geoxor
 */
export async function textify(pipeline: string[], sentence: string) {
  let fuckedSentence = sentence;

  const functions = pipeline.map((name) => textProcessors[name]).filter((processor) => !!processor);
  console.log(functions);
  const bar = logger.progress("Pipelines - ", functions.length);
  for (let i = 0; i < functions.length; i++) {
    const start = Date.now();
    const method = functions[i];
    fuckedSentence = await method(fuckedSentence);
    logger.setProgressValue(bar, i / functions.length);

    // This is to avoid exp thread blocking
    if (Date.now() - start > 10000) return fuckedSentence;
  }

  return fuckedSentence;
}

export async function brainfuck(sentence: string) {
  return textToBrainfuck(sentence);
}

export async function britify(sentence: string) {
  return textToBritify(sentence);
}

export async function spongify(sentence: string) {
  return textToSpongify(sentence);
}

export async function uwufy(sentence: string) {
  return textToUwufy(sentence);
}
