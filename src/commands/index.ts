// This file exists because the commands import faster
// when they are hardcoded like this than
// dynamically importing them with FS

import { ICommand } from "../types";
import { genCommands } from "../logic/logic.sakuria";
import { imageProcessors } from "../logic/imageProcessors.sakuria";
import logger from "../sakuria/Logger.sakuria";
import { getGPUTier } from "detect-gpu";

// economy game commands
import rank from "./economyGames/rank.sakuria";
// import battle from "./economyGames/battle.sakuria";
// import inventory from "./economyGames/inventory.sakuria";
// import stats from "./economyGames/stats.sakuria";

// fun commands
import anime from "./fun/anime.sakuria";
import ask from "./fun/ask.sakuria";
import decode from "./fun/decode.sakuria";
import dicksize from "./fun/dicksize.sakuria";
import tts from "./fun/tts.sakuria";
import mors from "./fun/mors.sakuria";
import say from "./fun/say.sakuria";
import traceAnime from "./fun/trace.sakuria";
import uwuify from "./fun/uwufy.sakuria";
import britify from "./fun/britify.sakuria";
import match from "./fun/match.sakuria";
import fact from "./fun/funfact.sakuria";

// moderation commands
import clear from "./moderation/clear.sakuria";
import kick from "./moderation/kick.sakuria";
import whois from "./moderation/whois.sakuria";

// utility commands
import help from "./utility/help.sakuria";
import invite from "./utility/invite.sakuria";
import ping from "./utility/ping.sakuria";
import avatar from "./utility/avatar.sakuria";
import env from "./utility/env.sakuria";

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

export const getCommands = async () => {
  let commands = [
    ...genCommands(Object.values(imageProcessors)),
    nowPlaying,
    transform,
    stack,
    avatar,
    rank,
    whois,
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
    decode,
    dicksize,
    help,
    invite,
    mors,
    say,
    traceAnime,
    uwuify,
    kick,
    // stats,
    // inventory,
    // battle,
  ];

  if (true) {
    logger.config.print("3D Capabilities acknowledged, loading 3D commands...");
    const { commands3D } = await import("../logic/3DRenderer.sakuria");
    genCommands(Object.values(commands3D)).forEach((command) => commands.push(command));
  }

  return commands;
};
