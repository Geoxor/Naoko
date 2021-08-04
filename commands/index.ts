import { ICommand } from "../types";
import anime from "./fun/anime.sakuria";
import ask from "./fun/ask.sakuria";
import clear from "./moderation/clear.sakuria";
import decode from "./fun/decode.sakuria";
import dicksize from "./fun/dicksize.sakuria";
import help from "./utility/help.sakuria";
import invite from "./utility/invite.sakuria";
import kick from "./moderation/kick.sakuria";
import mors from "./fun/mors.sakuria";
import say from "./fun/say.sakuria";
import traceAnime from "./fun/traceAnime.sakuria";
import uwuify from "./fun/uwuify.sakuria";
import invert from "./imageProcessing/invert.sakuria";
import play from "./musicPlayer/play.sakuria";
import skip from "./musicPlayer/skip.sakuria";
import shuffle from "./musicPlayer/shuffle.sakuria";
import waifu from "./fun/waifu.sakuria";

export const commands: ICommand[] = [
  waifu, 
  shuffle, 
  skip, 
  play, 
  anime, 
  invert, 
  ask, 
  clear, 
  decode, 
  dicksize, 
  help, 
  invite, 
  mors, 
  say, 
  traceAnime, 
  uwuify, 
  kick
];
