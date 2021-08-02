import { ICommand } from "../types";
import { command as anime } from "./anime.sakuria";
import { command as ask } from "./ask.sakuria";
import { command as clear } from "./clear.sakuria";
import { command as decode } from "./decode.sakuria";
import { command as dicksize } from "./dicksize.sakuria";
import { command as help } from "./help.sakuria";
import { command as invite } from "./invite.sakuria";
import { command as mors } from "./mors.sakuria";
import { command as say } from "./say.sakuria";
import { command as traceAnime } from "./traceAnime.sakuria";
import { command as uwuify } from "./uwuify.sakuria";

export const commands: ICommand[] = [
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
]