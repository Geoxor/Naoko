export type TextProcessorFn = (sentence: string, ...args: any) => Promise<string>;
export interface TextProcessors {
  [key: string]: TextProcessorFn;
}
