import "reflect-metadata";

// Clear the console
console.clear();

import chalk from "chalk";
import Naoko from "./naoko/Naoko.js";
import { container } from "@triptyk/tsyringe";
import { fileURLToPath } from "node:url";
import "./naoko/Database";
import { glob } from "glob";
import Logger from "./naoko/Logger";

const logger = container.resolve(Logger);

// Print log
logger.print(
  chalk.hex("#FF33A7")(`
          -%#-
         *@@@@*
        -@@%%@@-
  :====:-@@@@@@=:====:
*@@@@@@@@*+##@#+@@@@@@@*
 #@@@#@%##%.++=#%@*@@@#  by Geoxor & Friends v${Naoko.version}
  -*@@%***-  :%@@@@@*-    ▐ ▄  ▄▄▄·       ▄ •▄
     :#@@%+-%+****:      •█▌▐█▐█ ▀█ ▪     █▌▄▌▪▪
    -@@@@%@-@@%@@@@-     ▐█▐▐▌▄█▀▀█  ▄█▀▄ ▐▀▀▄· ▄█▀▄
    #@@%%@@=+@@@%@@#     ██▐█▌▐█ ▪▐▌▐█▌.▐▌▐█.█▌▐█▌.▐▌
    #@@@@*:  :#@@@@#     ▀▀ █▪ ▀  ▀  ▀█▄▀▪·▀  ▀ ▀█▄▀▪
\n`),
);

// Say inspirational anime quote
logger.inspiration();

// Get the absolute path to this file
const absolutePath = fileURLToPath(new URL("./", import.meta.url));
const files = await glob([absolutePath + "plugins/**/**.ts", absolutePath + "plugins/**.ts"]);
// Import them so all commands get registered inside the container
await Promise.all(files.map((file) => import(file)));

const naoko = container.resolve(Naoko);
await naoko.run();
