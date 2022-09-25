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
const iconPath =
  os.platform() === "linux"
    ? `/home/${os.userInfo().username}/.vscode/extensions/icons/`
    : `C:/Users/${os.userInfo().username}/.vscode/extensions/icons/`;
const settingsPath =
  os.platform() === "linux"
    ? `/home/${os.userInfo().username}/.config/Code/User/settings.json`
    : `C:/Users/${os.userInfo().username}/AppData/Roaming/Code/User/settings.json`;
// Create icons folder in .vscode/extensions
if (!fs.existsSync(iconPath)) {
  console.log("Creating icon folder");
  fs.mkdirSync(iconPath, { recursive: true });
}

// Install the SVG icons in there
console.log("Installing custom workspace icons");
fs.readdirSync("./src/assets/icons").forEach((file) => {
  fs.copyFileSync("./src/assets/icons/" + file, iconPath + file);
});
console.log("Icons installed");

// Update the user's VS Code settings to use the new icons for the naoko files
try {
  var vscodeSettings = require(settingsPath);
} catch (error: any) {
  console.log("VS Code settings.json has syntax errors (dangling commas), can't update settings, cancelling...");
  process.exit(1);
}
vscodeSettings["material-icon-theme.files.associations"] = {};
vscodeSettings["material-icon-theme.files.associations"]["naoko.json"] = "../../icons/naoko-json";
vscodeSettings["material-icon-theme.files.associations"]["naoko.ts"] = "../../icons/naoko";
vscodeSettings["material-icon-theme.files.associations"]["*.naoko"] = "../../icons/naoko";
vscodeSettings["material-icon-theme.files.associations"]["*.naoko.ts"] = "../../icons/naoko";
vscodeSettings["material-icon-theme.files.associations"]["logger.ts"] = "../../icons/naoko-logger";
vscodeSettings["material-icon-theme.files.associations"]["Naoko.naoko.ts"] = "../../icons/naoko-main";

vscodeSettings["material-icon-theme.folders.associations"] = {};
vscodeSettings["material-icon-theme.folders.associations"]["naoko"] = "../../../../icons/naoko-folder";

fs.writeFileSync(settingsPath, JSON.stringify(vscodeSettings, null, 2));
console.log("Settings updated");

// Inform them to reload their window
console.log(chalk.red("Please reload your VS Code window if your icons don't work"));
