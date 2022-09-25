// Documentation
// https://deploy-preview-680--discordjs-guide.netlify.app/additional-info/changes-in-v13.html

// Clear the console
console.clear();

// Cosmetic Imports
import chalk from "chalk";
import { version } from "../package.json";
import logger from "./naoko/Logger.naoko";

// Print log
logger.print(
  chalk.hex("#FF33A7")(`              
          -%#-          
         *@@@@*         
        -@@%%@@-        
  :====:-@@@@@@=:====:  
*@@@@@@@@*+##@#+@@@@@@@*
 #@@@#@%##%.++=#%@*@@@#  by Geoxor & Friends v${version}
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
import "./naoko/Naoko.naoko";
import "./naoko/Database.naoko";
