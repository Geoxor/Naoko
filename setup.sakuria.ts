import fs from "fs";
import os from "os";
import chalk from "chalk";

// The reason for this file is that the documentation on
// having custom icons in the .vscode folder is horrible and
// i have no clue on how the syntax is supposed to be ../../../../../../
// to have the fucking icons work properly so its easier to just
// fuck with the user's settings and append the configs to it and move
// the files to their global .vscode folder and have it work there
// you also get a nice bonus that the icons will work on other
// repos besides this one lol

// TODO: update this to work for linux as well
const iconPath = `C:/Users/${os.userInfo().username}/.vscode/extensions/icons/`;

// Create icons folder in .vscode/extensions
if (!fs.existsSync(iconPath)) {
  console.log("Creating icon folder");
  fs.mkdirSync(iconPath);
}

// Install the SVG icons in there
console.log("Installing custom workspace icons");
fs.readdirSync("./assets/icons").forEach((file) => {
  fs.copyFileSync("./assets/icons/" + file, iconPath + file);
});
console.log("Icons installed");

// Update the user's VS Code settings to use the new icons for the sakuria files
const vscodeSettings = require(`C:/Users/${os.userInfo().username}/AppData/Roaming/Code/User/settings.json`);
vscodeSettings["material-icon-theme.files.associations"] = {};
vscodeSettings["material-icon-theme.files.associations"]["sakuria.json"] = "../../icons/sakuriaJson";
vscodeSettings["material-icon-theme.files.associations"]["sakuria.ts"] = "../../icons/sakuria";
vscodeSettings["material-icon-theme.files.associations"]["*.sakuria"] = "../../icons/sakuria";
vscodeSettings["material-icon-theme.files.associations"]["*.sakuria.ts"] = "../../icons/sakuria";
vscodeSettings["material-icon-theme.files.associations"]["Logger.sakuria.ts"] = "../../icons/sakuriaLogger";
vscodeSettings["material-icon-theme.files.associations"]["Sakuria.sakuria.ts"] = "../../icons/sakuriaMain";
vscodeSettings["material-icon-theme.folders.associations"]["sakuria"] = "../../../../icons/sakuriaFolder";
fs.writeFileSync(`C:/Users/${os.userInfo().username}/AppData/Roaming/Code/User/settings.json`, JSON.stringify(vscodeSettings, null, 2));
console.log("Settings updated");

// Inform them to reload their window
console.log(chalk.red("Please reload your VS Code window if your icons don't work"));
