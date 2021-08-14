import { ICommand } from "../types";
import { genCommands, imageProcessors } from "../logic/imageProcessors.sakuria";

// economy game commands
// import battle from "./economyGames/battle.sakuria";
// import inventory from "./economyGames/inventory.sakuria";
// import stats from "./economyGames/stats.sakuria";

// fun commands
import anime from "./fun/anime.sakuria";
import ask from "./fun/ask.sakuria";
import decode from "./fun/decode.sakuria";
import dicksize from "./fun/dicksize.sakuria";
import mors from "./fun/mors.sakuria";
import say from "./fun/say.sakuria";
import traceAnime from "./fun/trace.sakuria";
import uwuify from "./fun/uwufy.sakuria";
import match from "./fun/match.sakuria";

// moderation commands
import clear from "./moderation/clear.sakuria";
import kick from "./moderation/kick.sakuria";

// utility commands
import help from "./utility/help.sakuria";
import invite from "./utility/invite.sakuria";
import ping from "./utility/ping.sakuria";
import avatar from "./utility/avatar.sakuria";

// music player commands
import play from "./musicPlayer/play.sakuria";
import skip from "./musicPlayer/skip.sakuria";
import shuffle from "./musicPlayer/shuffle.sakuria";
import nowPlaying from "./musicPlayer/nowPlaying.sakuria";

// image processing
import transform from "./imageProcessors/transform.sakuria";

export const commands: ICommand[] = [
  ...genCommands(Object.values(imageProcessors)),
  nowPlaying,
  transform,
  avatar,
  match,
  ping,
  // stats,
  // inventory,
  // battle,
  shuffle,
  skip,
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
];
