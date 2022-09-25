import { GEOXOR_GUILD_ID } from "../constants";
import { User } from "../naoko/Database";
import { defineCommand } from "../types";
import { definePlugin } from "../naoko/Plugin";
import { config } from "../naoko/Config";
import { RCONClient } from 'rcon.js';
import { logger } from "../naoko/Logger";
import Naoko from "../naoko/Naoko";


class MinecraftSynchronizer {
  public INTERVAL = 5000;
  public isConnected = false;
  public RCON_HOSTNAME = config.rconHost;
  public RCON_PASSWORD = config.rconPassword;
  public RCON_PORT = config.rconPort;
  public client = new RCONClient({
    host: this.RCON_HOSTNAME,
    port: this.RCON_PORT,
  });

  public constructor() {
    this.attemptLogins();
  }

  public attemptLogins = async () => {
    this.client.login(this.RCON_PASSWORD).then(() => {
      this.isConnected = true;
      this.start();
      // this.sendHelloWorld();
    }).catch(() => {
      Logger.error(`Failed to connect to RCON Minecraft, retrying in 30 seconds...`);
      setTimeout(() => this.attemptLogins(), 30000);
    })
  };

  public start = async () => {
    // Run once on startup and then do it again over and over
    this.synchronize().then(() => setInterval(() => this.synchronize(), this.INTERVAL));
  }

  public synchronize = async () => {
    if (!this.isConnected) return;

    const users = await User.find().where("minecraft_username").ne(null);

    await Promise.all(users.map(user => {
      const discordMember = Naoko.bot.guilds.cache.get(GEOXOR_GUILD_ID)?.members.cache.get(user.discord_id);
      if (!discordMember) return;

      const role = discordMember.roles.hoist;
      if (!role) return;

      const rolename = role.name
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
        .trim()
        .replace(/\s/g, "-")
        .toLowerCase();

      try {
        this.setRole(user.minecraft_username, rolename)
      } catch (error) {
        console.log(`Failed to update role for minecraft user: ${user.minecraft_username}`);
      }
    }))
  }

  public updateRole = (rolename: string, weight: number, hex: string, displayname: string) => {
    this.client.command(`lp group ${rolename} meta setprefix ${weight} "{${hex}}[${displayname}] &7"`)
    this.client.command(`lp group ${rolename} meta setsuffix ${weight} "&${hex}[${displayname}] &7"`)
  };

  public say = (text: string) => this.client.command(`say Naoko: ${text}`);

  public setRole = async (username: string, role: string) => {
    console.log(`Setting user: ${username} to minecraft role: ${role}`);
    this.client.command(`lp user ${username} parent set ${role}`);
  };

  public sendHelloWorld = async () => this.say(`Hello I've logged in!`)
}

// const minecraftSynchronizer = new MinecraftSynchronizer();

const MINECRAFT_USERNAME_REGEX = /^[a-zA-Z0-9_]{2,16}$/g

const mcname = defineCommand({
  name: "mcname",
  aliases: ["setmcname", "setminecraftusername"],
  category: "UTILITY",
  usage: "mcname <your minecraft username>",
  description: "Set your minecraft username (case sensitive) to sync your roles with your discord account",
  execute: async (message) => {
    const username = message.args[0];
    if (!username.match(MINECRAFT_USERNAME_REGEX)) {
      message.reply("Invalid minecraft username!");
      return;
    };

    message.databaseUser.update({ minecraft_username: username })
      .then(() => message.reply(`Saved your username \`${username}\` in the database`))
      .catch(() => message.reply("There was an error saving your username to the database, contact an admin"));

    return;
  },
});

export default definePlugin({
  name: "@geoxor/minecraft-sync",
  version: "1.0.0",
  command: [
    mcname,
  ],
});
