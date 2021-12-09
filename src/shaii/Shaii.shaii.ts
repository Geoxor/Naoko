import Discord, { Intents, TextChannel } from "discord.js";
import commandMiddleware from "../middleware/commandMiddleware.shaii";
import moderationMiddleware from "../middleware/moderationMiddleware.shaii";
import { logDelete, logEdit } from "../middleware/messageLoggerMiddleware.shaii";
import { ICommand } from "../types";
import logger from "./Logger.shaii";
import { getCommands } from "../commands";
import config from "./Config.shaii";
import { version } from "../../package.json";
import si from "systeminformation";
import { userMiddleware } from "../middleware/userMiddleware.shaii";
import { User } from "./Database.shaii";
import {
  APPROVED_GUILDS,
  GEOXOR_GENERAL_CHANNEL_ID,
  GEOXOR_GUILD_ID,
  GEOXOR_ID,
  QBOT_DEV_GUILD_ID,
  SHAII_ID,
  SECRET_GUILD_ID,
  SLURS,
  TARDOKI_ID,
} from "../constants";
import welcomeMessages from "../assets/welcome_messages.json";
import { markdown, randomChoice } from "../logic/logic.shaii";
import answers from "../assets/answers.json";

export let systemInfo: si.Systeminformation.StaticData;
logger.config.print("Fetching environment information...");
si.getStaticData().then((info) => {
  logger.config.print("Environment info fetched");
  systemInfo = info;
});

export let approvedGuilds: Array<Discord.Snowflake>;
approvedGuilds = [GEOXOR_GUILD_ID, SECRET_GUILD_ID, "897185485313699891"]

/**
 * Shaii multi purpose Discord bot
 * @author Geoxor, Cimok
 */
class Shaii {
  public bot: Discord.Client;
  public commands: Discord.Collection<string, ICommand>;
  public geoxorGuild: Discord.Guild | undefined;
  public version: string;

  constructor() {
    this.commands = new Discord.Collection();
    this.loadCommands();
    this.version = require("../../package.json").version;
    this.bot = new Discord.Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
    });
    this.bot.on("ready", () => {
      logger.shaii.instantiated();
      console.log(`Logged in as ${this.bot.user!.tag}!`);
      logger.shaii.numServers(this.bot.guilds.cache.size);
      this.updateActivity();
      this.leaveRogueGuilds();
      this.joinThreads();
    });
    this.bot.on("messageCreate", async (message) => this.onMessageCreate(message));
    this.bot.on("messageDelete", async (message) => {
      if (message.guild?.id === GEOXOR_GUILD_ID) {
        logDelete(message, (message) => {});
      }
    });
    this.bot.on("messageUpdate", async (oldMessage, newMessage) => {
      logEdit(oldMessage, newMessage, (oldMessage, newMessage) => {});
      userMiddleware(newMessage as Discord.Message, (newMessage) => {
        moderationMiddleware(newMessage, (newMessage) => {});
      });
    });
    this.bot.on("guildMemberRemove", async (member) => {
      if (member.id === SHAII_ID) return;
      let user = await User.findOneOrCreate(member);
      user.updateRoles(Array.from(member.roles.cache.keys()));
    });
    this.bot.on("guildMemberAdd", async (member) => {
      if (member.guild.id === GEOXOR_GUILD_ID) {
        (member.guild.channels.cache.get(GEOXOR_GENERAL_CHANNEL_ID)! as TextChannel)
          .send(`<@${member.id}> ${randomChoice(welcomeMessages).replace(/::GUILD_NAME/g, member.guild.name)}`)
          .then((m) => m.react("👋"));
      }

      let user = await User.findOneOrCreate(member);
      for (const roleId of user.roles) {
        const role = member.guild.roles.cache.find((role) => role.id === roleId);
        if (role) {
          member.roles
            .add(role)
            .then(() => logger.shaii.print(`Added return role ${roleId} to ${member.user.username}`))
            .catch(() => {});
        }
      }
    });
    this.bot.on("presenceUpdate", async (oldPresence, newPresence) => {
      // Get their custom status
      const newStatus = newPresence.activities.find((activity) => activity.type === "CUSTOM")?.state;
      const oldStatus = oldPresence?.activities.find((activity) => activity.type === "CUSTOM")?.state;

      if (!newStatus || !newPresence.user) return;

      // This stops it from acting when the user's status updates for another reason such as
      // spotify changing tunes or not, we don't care about thoes events we just care
      // about their custom status
      if (newStatus === oldStatus) return;

      const user = await User.findOne({ discord_id: newPresence.user.id });
      if (!user) return;

      // Get their latest status in the database
      const lastStatus = user.status_history[user.status_history.length - 1];

      // If they have no status yet or if their latest status in the database doesn't
      // match their current status then update the database
      if (!lastStatus || lastStatus.value !== newStatus) {
        logger.shaii.print(`Updated user status history for ${newPresence.user.id} '${newStatus}'`);
        User.pushHistory("status_history", newPresence.user.id, newStatus);
      }
    });
    this.bot.on("guildMemberUpdate", async (oldMember, newMember) => {
      if (oldMember.user.username !== newMember.user.username) {
        logger.shaii.print(`Updated username history for ${oldMember.id} '${newMember.user.username}'`);
        User.pushHistory("username_history", oldMember.id, newMember.user.username);
      }
      if (oldMember.nickname !== newMember.nickname && newMember.nickname) {
        logger.shaii.print(`Updated nickname history for ${oldMember.id} '${newMember.nickname}'`);
        User.pushHistory("nickname_history", oldMember.id, newMember.nickname);
      }
    });
    this.bot.on("voiceStateUpdate", (oldState, newState) => {
      // If geoxor is in vc and tardoki kun joins kick him out
      if (
        newState.channel?.members.some((member) => member.id === GEOXOR_ID) &&
        newState.channel?.members.some((member) => member.id === TARDOKI_ID)
      ) {
        const tardoki = newState.channel?.members.get(TARDOKI_ID);
        tardoki?.voice.disconnect();
      }
    });
    this.bot.on("threadCreate", (thread) => {
      thread.join();
    });
    this.bot.login(config.token);
    logger.shaii.login();
  }

  /**
   * Loads all the command files from ./commands
   */
  private async loadCommands() {
    logger.shaii.loadingCommands();

    for (const command of await getCommands()) {
      this.commands.set(command.name, command);
      logger.shaii.importedCommand(command.name);
    }
  }

  private updateActivity() {
    this.bot.user?.setActivity(`${config.prefix}help v${version}`, { type: "LISTENING" });
  }

  private joinThreads() {
    const channels = this.bot.channels.cache.values();
    for (let channel of channels) {
      if (channel.isThread()) {
        if (channel.ownerId === SHAII_ID) {
          channel.delete().then(() => logger.shaii.print(`Deleted residual battle thread ${channel.id}`));
          continue;
        }
        channel.join().then(() => logger.shaii.print(`Joined thread ${channel.id}`));
      }
    }
  }

  private leaveRogueGuilds() {
    for (let guild of this.bot.guilds.cache.values()) {
      if (guild.id ! in APPROVED_GUILDS) {
        guild.leave().then(() => logger.shaii.print(`Left guild ${guild.name}`));
      }
    }
  }

  private onMessageCreate(message: Discord.Message) {
    userMiddleware(message, (message) => {
      moderationMiddleware(message, (message) => {
        if (message.channel.id === GEOXOR_GENERAL_CHANNEL_ID && message.author.id !== GEOXOR_ID) return;

        // For channels that have "images" in their name we simply force delete any messages that don't have that in there
        if (
          message.guild?.channels.cache.get(message.channel.id)?.name.includes("images") &&
          message.attachments.size === 0
        )
          return message.delete();

        // Reply with a funny message if they mention her at the start of the message
        if (
          message.content.startsWith("<@!") &&
          message.mentions.members?.first()?.id === SHAII_ID &&
          message.type !== "REPLY"
        ) {
          logger.command.executedCommand(0, "@mention", message.author.username, message.guild?.name || "dm");

          // Reply with this when they purely ping her with no question
          if (!message.content.substr(`<@!${SHAII_ID}>`.length).trim())
            return message.reply("what tf do you want");
          return message.reply(randomChoice(answers));
        }

        commandMiddleware(message, async (message) => {
          const command =
            this.commands.get(message.command) ||
            this.commands.find((command) => command.aliases?.includes(message.command));

          const clearTyping = () => {
            if (processingMessage) {
              processingMessage.delete();
              // @ts-ignore
              clearInterval(typingInterval);
            }
          };

          // If it doesn't exist we respond
          if (!command)
            return message.reply(`That command doesn't exist ${randomChoice(SLURS)}`).catch(() => {});

          // Notify the user their shit's processing
          if (command.requiresProcessing) {
            var processingMessage = await message.channel.send("Processing...").catch(() => {});
            var typingInterval = setInterval(() => message.channel.sendTyping(), 4000);
          }

          // Check permissions
          if (command.permissions) {
            for (const perm of command.permissions) {
              if (!message.member?.permissions.has(perm)) {
                return message.reply(`You don't have the \`${perm}\` perm cunt`).catch(() => {});
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
            clearTyping();

            // This is pretty cringe
            if (error == "TypeError: Cannot read property 'getUniformLocation' of null") {
              return message.reply(
                "Shaii is currently running on a Server that does not have 3D acceleration, therefore she can't process this command, you can do `~env` to view the information of the current server shes running on"
              );
            }

            await message.reply(markdown(error)).catch(() => {});
          }

          // Delete the processing message if it exists
          clearTyping();

          // If the command returns void we just return
          if (!result) return;

          // Send the result
          try {
            await message.reply(result);
          } catch (error: any) {
            try {
              await message.channel.send(result);
            } catch (error: any) {
              if (error.code === 500) await message.reply("⚠️ when the upload speed");
              else await message.reply(markdown(error)).catch(() => {});
            }
          }
        });
      });
    });
  }
}

export default new Shaii();
