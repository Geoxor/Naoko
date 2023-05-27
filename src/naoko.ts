// Documentation
// https://deploy-preview-680--discordjs-guide.netlify.app/additional-info/changes-in-v13.html

// Clear the console
console.clear();

// Cosmetic Imports
import chalk from "chalk";
import packageJson from "../package.json" assert { type: 'json' };
import { logger } from "./naoko/Logger";

// Print log
logger.print(
  chalk.hex("#FF33A7")(`              
          -%#-          
         *@@@@*         
        -@@%%@@-        
  :====:-@@@@@@=:====:  
*@@@@@@@@*+##@#+@@@@@@@*
 #@@@#@%##%.++=#%@*@@@#  by Geoxor & Friends v${packageJson.version}
  -*@@%***-  :%@@@@@*-   .▄▄ ·   ▄  .▄  ▄▄▄· ▪   ▪  
     :#@@%+-%+****:      ▐█ ▀.  ██▪ ▐█ ▐█ ▀█ ██  ██ 
    -@@@@%@-@@%@@@@-     ▄▀▀▀█▄ ██▀ ▐█ ▄█▀▀█ ▐█· ▐█·
    #@@%%@@=+@@@%@@#     ▐█▄▪▐█ ██▌ ▐▀ ▐█ ▪▐▌▐█▌ ▐█▌
    #@@@@*:  :#@@@@#      ▀▀▀▀  ▀▀▀  ·  ▀  ▀ ▀▀▀ ▀▀▀
\n`)
);

// Say inspirational anime quote
logger.inspiration();

// Create naoko
import "./naoko/Naoko";
import "./naoko/Database";
