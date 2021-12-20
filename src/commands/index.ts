// This file exists because the commands import faster
// when they are hardcoded like this than
// dynamically importing them with FS

import { genCommands } from "../logic/logic.shaii";
import { imageProcessors } from "../logic/imageProcessors.shaii";
import { textProcessors } from "../logic/textProcessors.shaii";
import logger from "../shaii/Logger.shaii";

// economy game commands
// import rank from "./economyGames/rank.shaii";
import battle from "./economyGames/battle.shaii";
import inventory from "./economyGames/inventory.shaii";
import stats from "./economyGames/stats.shaii";
import rigbattle from "./moderation/rigbattle.shaii";

// fun commands
import anime from "./fun/anime.shaii";
import decode from "./fun/decode.shaii";
import dicksize from "./fun/dicksize.shaii";
import tts from "./fun/tts.shaii";
import mors from "./fun/mors.shaii";
import traceAnime from "./fun/trace.shaii";
import match from "./fun/match.shaii";
import fact from "./fun/funfact.shaii";
import say from "./fun/say.shaii";

// text processing
import textify from "./textProcessors/textify.shaii";
import brainfuck from "./textProcessors/brainfuck.shaii";
import britify from "./textProcessors/britify.shaii";
import spongify from "./textProcessors/spongify.shaii";
import uwuify from "./textProcessors/uwufy.shaii";

// moderation commands
import clear from "./moderation/clear.shaii";
import kick from "./moderation/kick.shaii";
import ban from "./moderation/ban.shaii";
import unban from "./moderation/unban.shaii";
import whois from "./moderation/whois.shaii";
import mute from "./moderation/mute.shaii";
import unmute from "./moderation/unmute.shaii";

// utility commands
import help from "./utility/help.shaii";
import ping from "./utility/ping.shaii";
import avatar from "./utility/avatar.shaii";
import uptime from "./utility/uptime.shaii";
import logs from "./utility/logs.shaii";
import env from "./utility/env.shaii";

// music player commands
import play from "./musicPlayer/play.shaii";
import skip from "./musicPlayer/skip.shaii";
import volume from "./musicPlayer/volume.shaii";
import shuffle from "./musicPlayer/shuffle.shaii";
import queue from "./musicPlayer/queue.shaii";
import nowPlaying from "./musicPlayer/nowPlaying.shaii";

// image processing
import transform from "./imageProcessors/transform.shaii";
import stack from "./imageProcessors/stack.shaii";
import vote from "./fun/vote.shaii";
import { commands3D } from "../logic/3DRenderer.shaii";

export const getCommands = async () => {
  let commands = [
    ...genCommands(Object.values(imageProcessors)),
    ...genCommands(Object.values(commands3D)),
    nowPlaying,
    transform,
    stack,
    avatar,
    whois,
    logs,
    tts,
    match,
    ping,
    inventory,
    stats,
    volume,
    fact,
    env,
    queue,
    shuffle,
    skip,
    uptime,
    britify,
    play,
    anime,
    clear,
    decode,
    rigbattle,
    dicksize,
    help,
    mors,
    traceAnime,
    uwuify,
    vote,
    kick,
    ban,
    battle,
    say,
    spongify,
    brainfuck,
    textify,
    mute,
    unmute,
    unban,
  ];

  return commands;
};
