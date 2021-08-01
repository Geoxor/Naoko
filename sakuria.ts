// Documentation
// https://deploy-preview-680--discordjs-guide.netlify.app/additional-info/changes-in-v13.html
require("dotenv").config();

// Clear the console
console.clear();

// Cosmetic Imports
import chalk from "chalk";
import { version } from "./package.json";
import logger from "./classes/Logger.sakuria";

// Print logo
console.log(
  chalk.hex("#FF33A7")(`              
          -%#-          
         *@@@@*         
        -@@%%@@-        
  :====:-@@@@@@=:====:  
*@@@@@@@@*+##@#+@@@@@@@*
 #@@@#@%##%.++=#%@*@@@#  by Geoxor 🌸                v${version}
  -*@@%***-  :%@@@@@*-  .▄▄ ·  ▄▄▄· ▄ •▄ ▄• ▄▌▄▄▄  ▪   ▄▄▄· 
     :#@@%+-%+****:     ▐█ ▀. ▐█ ▀█ █▌▄▌▪█▪██▌▀▄ █·██ ▐█ ▀█ 
    -@@@@%@-@@%@@@@-    ▄▀▀▀█▄▄█▀▀█ ▐▀▀▄·█▌▐█▌▐▀▀▄ ▐█·▄█▀▀█ 
    #@@%%@@=+@@@%@@#    ▐█▄▪▐█▐█ ▪▐▌▐█.█▌▐█▄█▌▐█•█▌▐█▌▐█ ▪▐▌ 
    #@@@@*:  :#@@@@#     ▀▀▀▀  ▀  ▀ ·▀  ▀ ▀▀▀ .▀  ▀▀▀▀ ▀  ▀ 
\n`)
);

// Say inspirational anime quote
logger.sakuria.inspiration();

// Create sakuria
logger.sakuria.creating();
// Main import
import "./classes/Sakuria.sakuria";
logger.sakuria.created();
