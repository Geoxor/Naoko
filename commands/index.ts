import { ICommand } from "../types";

// fun & game commands
import anime from "./fun/anime.sakuria";
import ask from "./fun/ask.sakuria";
import decode from "./fun/decode.sakuria";
import dicksize from "./fun/dicksize.sakuria";
import mors from "./fun/mors.sakuria";
import say from "./fun/say.sakuria";
import traceAnime from "./fun/traceAnime.sakuria";
import uwuify from "./fun/uwuify.sakuria";
import waifu from "./fun/battle.sakuria";

// moderation commands
import clear from "./moderation/clear.sakuria";
import kick from "./moderation/kick.sakuria";

// utility commands
import help from "./utility/help.sakuria";
import invite from "./utility/invite.sakuria";

// image processing commands
import invert from "./imageProcessing/invert.sakuria";

// music player commands
import play from "./musicPlayer/play.sakuria";
import skip from "./musicPlayer/skip.sakuria";
import shuffle from "./musicPlayer/shuffle.sakuria";
import nowPlaying from "./musicPlayer/nowPlaying.sakuria";

export const commands: ICommand[] = [nowPlaying, waifu, shuffle, skip, play, anime, invert, ask, clear, decode, dicksize, help, invite, mors, say, traceAnime, uwuify, kick];
