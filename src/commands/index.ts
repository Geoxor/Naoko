// This file exists because the commands import faster
// when they are hardcoded like this than
// dynamically importing them with FS

import { genCommands } from "../logic/logic";
import { imageProcessors } from "../logic/imageProcessors";

// economy game commands
// import rank from "./economyGames/rank";

// fun commands
import anime from "./fun/anime";
import dicksize from "./fun/dicksize";
import traceAnime from "./fun/trace";
import match from "./fun/match";
import say from "./fun/say";

// text processing
import textify from "./textProcessors/textify";
import brainfuck from "./textProcessors/brainfuck";
import britify from "./textProcessors/britify";
import spongify from "./textProcessors/spongify";
import uwuify from "./textProcessors/uwufy";

// moderation commands
import clear from "./moderation/clear";
import kick from "./moderation/kick";
import ban from "./moderation/ban";
import unban from "./moderation/unban";
import whois from "./moderation/whois";
import mute from "./moderation/mute";
import unmute from "./moderation/unmute";

// utility commands
import help from "./utility/help";
import ping from "./utility/ping";
import plugins from "./utility/plugins";
import uptime from "./utility/uptime";
import logs from "./utility/logs";
import env from "./utility/env";

// image processing
import transform from "./imageProcessors/transform";
import stack from "./imageProcessors/stack";
import vote from "./fun/vote";
import { commands3D } from "../logic/3DRenderer";

export const getCommands = async () => {
  let commands = [
    ...genCommands(Object.values(imageProcessors)),
    ...genCommands(Object.values(commands3D)),
    transform,
    stack,
    whois,
    logs,
    match,
    plugins,
    ping,
    env,
    uptime,
    britify,
    anime,
    clear,
    dicksize,
    help,
    traceAnime,
    uwuify,
    vote,
    kick,
    ban,
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
