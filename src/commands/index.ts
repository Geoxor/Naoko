// This file exists because the commands import faster
// when they are hardcoded like this than
// dynamically importing them with FS

import { genCommands } from "../logic/logic.naoko";
import { imageProcessors } from "../logic/imageProcessors.naoko";

// economy game commands
// import rank from "./economyGames/rank.naoko";
import battle from "./economyGames/battle.naoko";
import inventory from "./economyGames/inventory.naoko";
import stats from "./economyGames/stats.naoko";
import rigbattle from "./moderation/rigbattle.naoko";

// fun commands
import anime from "./fun/anime.naoko";
import dicksize from "./fun/dicksize.naoko";
import traceAnime from "./fun/trace.naoko";
import match from "./fun/match.naoko";
import say from "./fun/say.naoko";

// text processing
import textify from "./textProcessors/textify.naoko";
import brainfuck from "./textProcessors/brainfuck.naoko";
import britify from "./textProcessors/britify.naoko";
import spongify from "./textProcessors/spongify.naoko";
import uwuify from "./textProcessors/uwufy.naoko";

// moderation commands
import clear from "./moderation/clear.naoko";
import kick from "./moderation/kick.naoko";
import ban from "./moderation/ban.naoko";
import unban from "./moderation/unban.naoko";
import whois from "./moderation/whois.naoko";
import mute from "./moderation/mute.naoko";
import unmute from "./moderation/unmute.naoko";

// utility commands
import help from "./utility/help.naoko";
import ping from "./utility/ping.naoko";
import plugins from "./utility/plugins.naoko";
import uptime from "./utility/uptime.naoko";
import logs from "./utility/logs.naoko";
import env from "./utility/env.naoko";

// music player commands
import play from "./musicPlayer/play.naoko";
import skip from "./musicPlayer/skip.naoko";
import volume from "./musicPlayer/volume.naoko";
import shuffle from "./musicPlayer/shuffle.naoko";
import queue from "./musicPlayer/queue.naoko";
import nowPlaying from "./musicPlayer/nowPlaying.naoko";

// image processing
import transform from "./imageProcessors/transform.naoko";
import stack from "./imageProcessors/stack.naoko";
import vote from "./fun/vote.naoko";
import { commands3D } from "../logic/3DRenderer.naoko";

export const getCommands = async () => {
  let commands = [
    ...genCommands(Object.values(imageProcessors)),
    ...genCommands(Object.values(commands3D)),
    nowPlaying,
    transform,
    stack,
    whois,
    logs,
    match,
    plugins,
    ping,
    inventory,
    stats,
    volume,
    env,
    queue,
    shuffle,
    skip,
    uptime,
    britify,
    play,
    anime,
    clear,
    rigbattle,
    dicksize,
    help,
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
