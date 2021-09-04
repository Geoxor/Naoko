// This file exists because the commands import faster
// when they are hardcoded like this than
// dynamically importing them with FS

import { ICommand } from "src/types";
import { genCommands } from "../logic/logic.sakuria";
import { imageProcessors } from "../logic/imageProcessors.sakuria";

// economy game commands
// import battle from "./economyGames/battle.sakuria";
// import inventory from "./economyGames/inventory.sakuria";
// import stats from "./economyGames/stats.sakuria";

// fun commands
import anime from "./fun/anime.sakuria";
import ask from "./fun/ask.sakuria";
import dongsize from "./fun/dongsize.sakuria";
import tts from "./fun/tts.sakuria";
import morse from "./fun/morse.sakuria";
import traceAnime from "./fun/trace.sakuria";
import uwuify from "./fun/uwufy.sakuria";
import britify from "./fun/britify.sakuria";
import match from "./fun/match.sakuria";
import fact from "./fun/funfact.sakuria";

// moderation commands
import clear from "./moderation/clear.sakuria";
import kick from "./moderation/kick.sakuria";

// utility commands
import invite from "./utility/invite.sakuria";
import ping from "./utility/ping.sakuria";
import avatar from "./utility/avatar.sakuria";
import env from "./utility/env.sakuria";
import help from "./utility/help.sakuria";

// music player commands
import play from "./musicPlayer/play.sakuria";
import skip from "./musicPlayer/skip.sakuria";
import volume from "./musicPlayer/volume.sakuria";
import shuffle from "./musicPlayer/shuffle.sakuria";
import queue from "./musicPlayer/queue.sakuria";
import nowPlaying from "./musicPlayer/nowPlaying.sakuria";

// image processing
import transform from "./imageProcessors/transform.sakuria";
import stack from "./imageProcessors/stack.sakuria";

export const commands: ICommand[] = [
  ...genCommands(Object.values(imageProcessors)),
  nowPlaying,
  transform,
  stack,
  avatar,
  help,
  tts,
  match,
  ping,
  volume,
  fact,
  env,
  queue,
  shuffle,
  skip,
  britify,
  play,
  anime,
  ask,
  clear,
  dongsize,
  invite,
  morse,
  traceAnime,
  uwuify,
  kick,
  // stats,
  // inventory,
  // battle,
];
