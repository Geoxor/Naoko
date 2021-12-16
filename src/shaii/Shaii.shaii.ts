import Discord, { Intents, MessageReaction, PartialMessageReaction, TextChannel } from "discord.js";
import commandMiddleware from "../middleware/commandMiddleware.shaii";
import moderationMiddleware from "../middleware/moderationMiddleware.shaii";
import { logDelete, logEdit } from "../middleware/messageLoggerMiddleware.shaii";
import { ICommand } from "../types";
import logger from "./Logger.shaii";
import { getCommands } from "../commands";
import config from "./Config.shaii";
import { version } from "../../package.json";
import si from "systeminformation";
import { userMiddleware, hasGhostsRole, giveGhostsRole } from "../middleware/userMiddleware.shaii";
import { User } from "./Database.shaii";
import {
  GEOXOR_GENERAL_CHANNEL_ID,
  GEOXOR_GUILD_ID,
  GEOXOR_ID,
  GHOSTS_ROLE_ID,
  QBOT_DEV_GUILD_ID,
  SHAII_ID,
  TESTING_GUILD_ID,
  SLURS,
  TARDOKI_ID,
  MUTED_ROLE_ID,
} from "../constants";
import welcomeMessages from "../assets/welcome_messages.json";
import { highlight, markdown, randomChoice } from "../logic/logic.shaii";
import answers from "../assets/answers.json";
import levenshtein from "js-levenshtein";

export let systemInfo: si.Systeminformation.StaticData;
logger.print("Fetching environment information...");
si.getStaticData().then((info) => {
  logger.print("Environment info fetched");
  systemInfo = info;
});

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
      logger.print("Instantiated Discord client instance");
      logger.print(`Logged in as ${this.bot.user!.tag}!`);
      logger.print(`Currently in ${this.bot.guilds.cache.size} servers`);
      this.updateActivity();
      this.leaveRogueGuilds();
      this.joinThreads();
    });
    this.bot.on("messageCreate", async (message) => this.onMessageCreate(message));
    this.bot.on("messageDelete", async (message) => {
      if (message.guild?.id === GEOXOR_GUILD_ID || message.guild?.id === QBOT_DEV_GUILD_ID) {
        logDelete(message, (message) => {});
      }
    });
    this.bot.on("messageUpdate", async (oldMessage, newMessage) => {
      logEdit(oldMessage, newMessage, (oldMessage, newMessage) => {});
      userMiddleware(newMessage as Discord.Message, (newMessage) => {
        moderationMiddleware(newMessage, (newMessage) => {});
      });
    });
    this.bot.on("messageReactionAdd", async (messageReaction, user) => this.onMessageReactionAdd(messageReaction, user));
    this.bot.on("guildMemberRemove", async (member) => {
      if (member.id === SHAII_ID) return;
      let user = await User.findOneOrCreate(member);
      user.updateRoles(Array.from(member.roles.cache.keys()));
    });
    this.bot.on("guildMemberAdd", async (member) => {
      if (member.guild.id === GEOXOR_GUILD_ID || member.guild.id === QBOT_DEV_GUILD_ID) {
        if (!hasGhostsRole(member)) {
          giveGhostsRole(member).catch((error) => {
            logger.error(error as string);
          });
        }
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
            .then(() => logger.print(`Added return role ${roleId} to ${member.user.username}`))
            .catch((error) => {
              logger.error(error as string);
            });
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
        logger.print(`Updated user status history for ${newPresence.user.id} '${newStatus}'`);
        User.pushHistory("status_history", newPresence.user.id, newStatus);
      }
    });
    this.bot.on("guildMemberUpdate", async (oldMember, newMember) => {
      if (oldMember.user.username !== newMember.user.username) {
        logger.print(`Updated username history for ${oldMember.id} '${newMember.user.username}'`);
        User.pushHistory("username_history", oldMember.id, newMember.user.username);
      }
      if (oldMember.nickname !== newMember.nickname && newMember.nickname) {
        logger.print(`Updated nickname history for ${oldMember.id} '${newMember.nickname}'`);
        User.pushHistory("nickname_history", oldMember.id, newMember.nickname);
      }
    });
    this.bot.on("threadCreate", (thread) => {
      thread.join();
    });
    this.bot.login(config.token);
    logger.print("Shaii logging in...");
  }

  public getClosestCommand(searchString: string): ICommand | undefined {
    let closest: { command: ICommand | undefined; distance: number } = {
      command: undefined,
      distance: 4, // ld: levenshtein distance
    };
    for (const [name, command] of this.commands.entries()) {
      const currentCommandDistance = levenshtein(name, searchString);

      if (currentCommandDistance < closest.distance) {
        closest.command = command;
        closest.distance = currentCommandDistance;
      }
    }

    if (!closest.command || closest.distance > 3) {
      return;
    }

    return closest.command;
  }

  public hasGhostRole(member: Discord.GuildMember): boolean {
    return member.roles.cache.has("736285344659669003");
  }

  /**
   * Loads all the command files from ./commands
   */
  private async loadCommands() {
    logger.print("Loading commands...");

    for (const command of await getCommands()) {
      this.commands.set(command.name, command);
      logger.print(`┖ Imported command ${command.name}`);
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
          channel
            .delete()
            .then(() => logger.print(`Deleted residual battle thread ${channel.id}`))
            .catch(() => {});
          continue;
        }
        channel.join().then(() => logger.print(`Joined thread ${channel.id}`));
      }
    }
  }

  private leaveRogueGuilds() {
    for (let guild of this.bot.guilds.cache.values()) {
      if (guild.id !== GEOXOR_GUILD_ID && guild.id !== TESTING_GUILD_ID && guild.id !== QBOT_DEV_GUILD_ID) {
        guild.leave().then(() => logger.print(`Left guild ${guild.name}`));
      }
    }
  }

  private onMessageCreate(message: Discord.Message) {
    userMiddleware(message, (message) => {
      moderationMiddleware(message, (message) => {
        if (message.channel.id === GEOXOR_GENERAL_CHANNEL_ID && message.author.id !== GEOXOR_ID) return;

        // If some users joined while legacy Shaii was kicked, adds to them the ghost role if they talk in chat
        if (message.member) {
          if (!this.hasGhostRole(message.member)) {
            message.member.roles.add(GHOSTS_ROLE_ID).catch((error) => {
              logger.error(error as string);
            });
          }
        }

        // I'm tired of seeing people doing !rank unsuccessfully so we tell them it doesn't work anymore
        if (message.cleanContent == "!rank") {
          try {
            return message.reply(
              "The bot that used to manage the XP system has been discontinued.\nWe are currently working on implementing a new one to this bot. Stay tuned!"
            );
          } catch (error) {
            logger.error(error as string);
          }
        }

        // For channels that have "images" in their name we simply force delete any messages that don't have that in there
        if (
          message.guild?.channels.cache.get(message.channel.id)?.name.includes("images") &&
          message.attachments.size === 0
        )
          return message.delete().catch(() => {});

        // Reply with a funny message if they mention her at the start of the message
        if (
          message.content.startsWith("<@!") &&
          message.mentions.members?.first()?.id === SHAII_ID &&
          message.type !== "REPLY"
        ) {
          logger.print(
            `0ms - Executed command: @mention - User: ${message.author.username} - Guild: ${message.guild?.name || "dm"}`
          );

          // Reply with this when they purely ping her with no question
          if (!message.content.substring(`<@!${SHAII_ID}>`.length).trim()) return message.reply("what tf do you want");
          return message.reply(randomChoice(answers));
        }

        commandMiddleware(message, async (message) => {
          const command =
            this.commands.get(message.command) ||
            this.commands.find((command) => command.aliases?.includes(message.command));

          const clearTyping = () => {
            if (processingMessage) {
              processingMessage.delete().catch(() => {});
              // @ts-ignore
              clearInterval(typingInterval);
            }
          };

          // If it doesn't exist we respond
          if (!command) {
            const commandDoesntExistString = `That command doesn't exist ${randomChoice(SLURS)}`;
            const closestCommand = this.getClosestCommand(message.command);

            if (closestCommand)
              return message
                .reply(
                  `${commandDoesntExistString}\nthere's this however ${highlight(config.prefix + closestCommand.usage)}`
                )
                .catch(() => {});

            return message.reply(`${commandDoesntExistString}`).catch(() => {});
          }

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
            logger.print(
              `${timeEnd - timeStart}ms - Executed command: ${command.name} - User: ${message.author.username} - Guild: ${
                message.guild?.name || "dm"
              }`
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
              if (error.code === 500) {
                const embed = new Discord.MessageEmbed().setColor("#ffcc4d").setDescription("⚠️ when the upload speed");
                await message.reply({ embeds: [embed] }).catch(() => {});
              } else await message.reply(markdown(error)).catch(() => {});
            }
          }
        });
      });
    });
  }

  public onMessageReactionAdd(
    messageReaction: MessageReaction | PartialMessageReaction,
    user: Discord.User | Discord.PartialUser
  ) {
    const messageReactionGuild = this.bot.guilds.cache.get(messageReaction.message.guild?.id || "");
    if (!messageReactionGuild) return;
    messageReactionGuild.members.fetch().then((data) => {
      if (data.get(user.id)?.roles.cache.has(MUTED_ROLE_ID)) {
        messageReaction.remove();
      }
      return;
    });
  }
}

export default new Shaii();
