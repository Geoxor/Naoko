import fs from 'fs'
import os from "os";
import chalk from "chalk"

// TODO: update this to work for linux as well
const iconPath = `C:/Users/${os.userInfo().username}/.vscode/extensions/icons/`;

// Create icons folder in .vscode/extensions
if (!fs.existsSync(iconPath)) {
  console.log("Creating icon folder");
  fs.mkdirSync(iconPath);
}

// Install the SVG icons in there
console.log("Installing custom workspace icons");
fs.readdirSync('./assets/icons').forEach(file => {
  fs.copyFileSync('./assets/icons/' + file, iconPath + file.replace("icons", ""));
});
console.log("Icons installed"); 

// Update the user's VS Code settings to use the new icons for the sakuria files
const vscodeSettings = require(`C:/Users/${os.userInfo().username}/AppData/Roaming/Code/User/settings.json`);
vscodeSettings["material-icon-theme.files.associations"]["sakuria.json"] = "../../icons/sakuriaJson";
vscodeSettings["material-icon-theme.files.associations"]["sakuria.ts"] = "../../icons/sakuria";
vscodeSettings["material-icon-theme.files.associations"]["*.sakuria"] = "../../icons/sakuria";
vscodeSettings["material-icon-theme.files.associations"]["*.sakuria.ts"] = "../../icons/sakuria";
fs.writeFileSync(`C:/Users/${os.userInfo().username}/AppData/Roaming/Code/User/settings.json`, JSON.stringify(vscodeSettings, null, 2));
console.log("Settings updated"); 

// Inform them to reload their window
console.log(chalk.red("Please reload your VS Code window"));
