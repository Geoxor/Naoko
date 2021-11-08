import Discord, { Intents } from "discord.js";
import commandMiddleware from "../middleware/commandMiddleware.sakuria";
import moderationMiddleware from "../middleware/moderationMiddleware.sakuria";
import { logDelete, logEdit } from "../middleware/messageLoggerMiddleware.sakuria";
import { ICommand } from "../types";
import logger from "./Logger.sakuria";
import { getCommands } from "../commands";
import config from "./Config.sakuria";
import { version } from "../../package.json";
import si from "systeminformation";
import { userMiddleware } from "../middleware/userMiddleware.sakuria";
import { User } from "./Database.sakuria";

export let systemInfo: si.Systeminformation.StaticData;
logger.config.print("Fetching environment information...");
si.getStaticData().then((info) => {
  logger.config.print("Environment info fetched");
  systemInfo = info;
});

/**
 * Sakuria multi purpose Discord bot
 * @author Geoxor, Cimok
 */
class Sakuria {
  public bot: Discord.Client;
  public commands: Discord.Collection<string, ICommand>;
  public SAKURIA_ID = "870496144881492069";
  public GEOXOR_GUILD_ID = "385387666415550474";
  public geoxorGuild: Discord.Guild | undefined;

  constructor() {
    this.commands = new Discord.Collection();
    this.loadCommands();
    this.bot = new Discord.Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
    });
    this.bot.on("ready", () => this.onReady());
    this.bot.on("messageCreate", (message) => this.onMessageCreate(message));
    this.bot.on("messageDelete", (message) => this.onMessageDelete(message));
    this.bot.on("messageUpdate", (oldMessage, newMessage) => this.onMessageUpdate(oldMessage, newMessage));
    this.bot.on("guildMemberRemove", (member) => this.onGuildMemberRemove(member));
    this.bot.on("guildMemberAdd", (member) => this.onGuildMemberAdd(member));
    this.bot.on("threadCreate", (thread) => {
      thread.join();
    });
    this.bot.login(config.token);
    logger.sakuria.login();
  }

  /**
   * Loads all the command files from ./commands
   */
  private async loadCommands() {
    logger.sakuria.loadingCommands();

    for (const command of await getCommands()) {
      this.commands.set(command.name, command);
      logger.sakuria.importedCommand(command.name);
    }
  }

  private async onReady() {
    logger.sakuria.instantiated();
    console.log(`Logged in as ${this.bot.user!.tag}!`);
    logger.sakuria.numServers(this.bot.guilds.cache.size);
    this.updateActivity();
    this.leaveRogueGuilds();
    this.joinThreads();
  }

  private updateActivity() {
    this.bot.user?.setActivity(`${config.prefix}help v${version}`, { type: "LISTENING" });
  }

  private joinThreads() {
    const channels = this.bot.channels.cache.values();
    for (let channel of channels) {
      if (channel.isThread()) {
        channel.join().then(() => logger.sakuria.print(`Joined thread ${channel.id}`));
      }
    }
  }

  private leaveRogueGuilds() {
    for (let guild of this.bot.guilds.cache.values()) {
      if (guild.id !== this.GEOXOR_GUILD_ID) {
        guild.leave().then(() => logger.sakuria.print(`Left guild ${guild.name}`));
      }
    }
  }

  private async onGuildMemberAdd(member: Discord.GuildMember) {
    let user = await User.findOneOrCreate(member);
    for (const roleId of user.roles) {
      const role = member.guild.roles.cache.find((role) => role.id === roleId);
      if (role) {
        member.roles
          .add(role)
          .then(() => logger.sakuria.print(`Added return role ${roleId} to ${member.user.username}`))
          .catch(() => {});
      }
    }
  }

  private async onGuildMemberRemove(member: Discord.GuildMember | Discord.PartialGuildMember) {
    if (member.id === this.SAKURIA_ID) return;
    let user = await User.findOneOrCreate(member);
    logger.sakuria.print(`Updating roles for ${member.user.username}`);
    user.updateRoles(Array.from(member.roles.cache.keys()));
  }

  private onMessageUpdate(
    oldMessage: Discord.Message | Discord.PartialMessage,
    newMessage: Discord.Message | Discord.PartialMessage
  ) {
    logEdit(oldMessage, newMessage, (oldMessage, newMessage) => {});
  }

  private onMessageDelete(message: Discord.Message | Discord.PartialMessage) {
    logDelete(message, (message) => {});
  }

  // onMessageCreate handler
  private onMessageCreate(message: Discord.Message) {
    userMiddleware(message, (message) => {
      moderationMiddleware(message, (message) => {
        commandMiddleware(message, async (message) => {
          // Slurs for idiots
          const slurs = ["idiot", "baka", "mennn", "cunt", "noob", "scrub", "fucker", "you dumb fucking twat"];

          // Fetch the command
          const command = this.commands.get(message.command);

          // If it doesn't exist we respond
          if (!command) {
            message.reply(`That command doesn't exist ${slurs[~~(Math.random() * slurs.length)]}`);
            return;
          }

          // Notify the user their shit's processing
          if (command.requiresProcessing) {
            var processingMessage = await message.channel.send("Processing...");
            var typingInterval = setInterval(() => message.channel.sendTyping(), 4000);
          }

          // Check permissions
          if (command.permissions) {
            for (const perm of command.permissions) {
              if (!message.member?.permissions.has(perm)) {
                return message.reply(`You don't have the \`${perm}\` perm cunt`);
              }
            }
          }

          // Get the result to send from the command
          try {
            let timeStart = Date.now();
            var result = await command.execute(message);
            let timeEnd = Date.now();
            logger.command.executedCommand(
              timeEnd - timeStart,
              command.name,
              message.author.username,
              message.guild?.name || "dm"
            );
          } catch (error: any) {
            console.log(error);
            await message.reply(`\`\`\`${error}\`\`\``);
          }

          // Delete the processing message if it exists
          // @ts-ignore
          if (processingMessage) {
            processingMessage.delete();
            // @ts-ignore
            clearInterval(typingInterval);
          }

          // If the command returns void we just return
          if (!result) return;

          // Send the result
          try {
            await message.reply(result);
          } catch (error: any) {
            try {
              await message.channel.send(result);
            } catch (error: any) {
              console.log(error);
              if (error.code === 500) await message.reply("⚠️ when the upload speed");
              else await message.reply(`\`\`\`${error}\`\`\``);
            }
          }
        });
      });
    });
  }
}

export default new Sakuria();
