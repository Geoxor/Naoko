// Documentation
// https://deploy-preview-680--discordjs-guide.netlify.app/additional-info/changes-in-v13.html

// Clear the console
console.clear();

// Cosmetic Imports
import chalk from "chalk";
import { version } from "../package.json";
import logger from "./shaii/Logger.shaii";

// Print log
logger.print(
  chalk.hex("#FF33A7")(`              
          -%#-          
         *@@@@*         
        -@@%%@@-        
  :====:-@@@@@@=:====:  
*@@@@@@@@*+##@#+@@@@@@@*
 #@@@#@%##%.++=#%@*@@@#  by Geoxor 🌸        v${version}
  -*@@%***-  :%@@@@@*-   .▄▄ ·   ▄  .▄  ▄▄▄· ▪   ▪  
     :#@@%+-%+****:      ▐█ ▀.  ██▪ ▐█ ▐█ ▀█ ██  ██ 
    -@@@@%@-@@%@@@@-     ▄▀▀▀█▄ ██▀ ▐█ ▄█▀▀█ ▐█· ▐█·
    #@@%%@@=+@@@%@@#     ▐█▄▪▐█ ██▌ ▐▀ ▐█ ▪▐▌▐█▌ ▐█▌
    #@@@@*:  :#@@@@#      ▀▀▀▀  ▀▀▀  ·  ▀  ▀ ▀▀▀ ▀▀▀
\n`)
);

// Say inspirational anime quote
logger.inspiration();

// Create shaii
logger.print("Creating new Shaii instance...");
import "./shaii/Shaii.shaii";
import "./shaii/Database.shaii";
logger.print("Shaii created");
