import Discord, { Intents, MessageReaction, PartialMessageReaction, TextChannel } from "discord.js";
import commandMiddleware from "../middleware/commandMiddleware.shaii";
import moderationMiddleware from "../middleware/moderationMiddleware.shaii";
import { logDelete, logEdit } from "../middleware/messageLoggerMiddleware.shaii";
import { GeoxorGuildRole, ICommand } from "../types";
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
  MUTED_ROLE_ID,
  SVRGE_ID,
  MORPHEUS_ID,
} from "../constants";
import welcomeMessages from "../assets/welcome_messages.json";
import { highlight, markdown, randomChoice, removeMentions } from "../logic/logic.shaii";
import answers from "../assets/answers.json";
import levenshtein from "js-levenshtein";
import fs from "fs";
import path from "path";
import { DISCORD_EVENTS, Plugin } from "../shaii/Plugin.shaii";

export let systemInfo: si.Systeminformation.StaticData;
logger.print("Fetching environment information...");
si.getStaticData().then((info) => {
  logger.print("Environment info fetched");
  systemInfo = info;
});

const emojiRegExp: RegExp =
  /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;

/**
 * Shaii multi purpose Discord bot
 * @author Geoxor, Cimok
 */
class Shaii {
  public commands: Discord.Collection<string, ICommand> = new Discord.Collection();
  public geoxorGuild: Discord.Guild | undefined;
  public version: string = require("../../package.json").version;
  public geoxorRoleList: GeoxorGuildRole[] | undefined;
  public plugins: Plugin[] = fs
    .readdirSync("./src/plugins")
    .filter((file) => file.endsWith(".ts"))
    .map((file) => require(path.join("../plugins/" + file)).default);
  public bot: Discord.Client = new Discord.Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_PRESENCES,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_VOICE_STATES,
    ],
  });
  constructor() {
    console.log(this.plugins);
    this.loadCommands();
    for (const event of DISCORD_EVENTS) {
      this.bot.on(event as string, (data) => {
        this.plugins.forEach((plugin) => plugin.send(event, [data]));
      });
    }

    this.bot.on("ready", () => {
      logger.print("Instantiated Discord client instance");
      logger.print(`Logged in as ${this.bot.user!.tag}!`);
      logger.print(`Currently in ${this.bot.guilds.cache.size} servers`);
      this.updateActivity();
      this.leaveRogueGuilds();
      this.joinThreads();
      this.geoxorGuild = this.bot.guilds.cache.get(GEOXOR_GUILD_ID);
      this.geoxorRoleList = (this.geoxorGuild || this.bot.guilds.cache.get(QBOT_DEV_GUILD_ID))?.roles.cache.map((role) => {
        return {
          name: role.name.replace(emojiRegExp, "").trim(),
          emoji: role.name.replace(/(\w\S+)/g, "").trim(),
          id: role.id,
        };
      });
      this.geoxorRoleList?.shift();
    });
    this.bot.on("messageCreate", async (message) => {
      // TODO: Make this automatically pass EVERY event to all the plugins instead of only here
      this.onMessageCreate(message);
    });
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
        if (!hasGhostsRole(member) && member.guild.id === GEOXOR_GUILD_ID) {
          giveGhostsRole(member).catch(() => {
            logger.error("Couldn't give Ghosts role to the member.");
          });
        }
        try {
          (member.guild.channels.cache.get(GEOXOR_GENERAL_CHANNEL_ID)! as TextChannel)
            .send(`<@${member.id}> ${randomChoice(welcomeMessages).replace(/::GUILD_NAME/g, member.guild.name)}`)
            .then((m) => m.react("👋"));
        } catch {
          logger.error(`The channel <#${GEOXOR_GENERAL_CHANNEL_ID}> doesn't exist`);
        }
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

  public doesNicknameStartWithEmoji(nickname: string, member: Discord.GuildMember): boolean {
    if (!this.geoxorRoleList) return true;
    for (let i = 0; i < this.geoxorRoleList.length; i++) {
      if (nickname !== nickname.replace((this.geoxorRoleList[i].emoji as string)[0], "")) return true;
    }
    return false;
  }

  /**
   * Adds an emoji before the nickname of the member if it has not
   * @param member the member to add an emoji to their nickname
   * @param emoji the emoji to add
   * @returns true if the operation is a success, false otherwise
   * @author Qexat
   */
  public nickEmojifier(member: Discord.GuildMember | null, role?: GeoxorGuildRole): boolean {
    if (member && role && this.geoxorRoleList) {
      const currentNickname = member.nickname || member.displayName;
      if (!this.doesNicknameStartWithEmoji(currentNickname, member) && member.user.id !== member.guild.ownerId) {
        try {
          member.setNickname(`${role.emoji} ${currentNickname}`.slice(0, 31));
          return true;
        } catch (error) {
          logger.error(error as string);
        }
      }
      return false;
    } else {
      logger.error("Cannot emojify this member's nickname.");
      return false;
    }
  }

  private nickEmojiAdd(member: Discord.GuildMember) {
    if (!this.geoxorRoleList) return;
    member.roles.cache.forEach((memberRole) => {
      if (memberRole.hoist)
        this.geoxorRoleList?.forEach((guildRole) => {
          if (memberRole.name.replace(emojiRegExp, "").trim() === guildRole.name && this.nickEmojifier(member, guildRole))
            return;
        });
    });
  }

  private onMessageCreate(message: Discord.Message) {
    userMiddleware(message, (message) => {
      moderationMiddleware(message, (message) => {
        if (
          message.channel.id === GEOXOR_GENERAL_CHANNEL_ID &&
          ![GEOXOR_ID, SVRGE_ID, MORPHEUS_ID].includes(message.author.id)
        )
          return;

        // If some users joined while legacy Shaii was kicked, adds to them the ghost role if they talk in chat
        if (message.member && (message.guild?.id === GEOXOR_GUILD_ID || message.guild?.id === QBOT_DEV_GUILD_ID)) {
          if (!this.hasGhostRole(message.member)) {
            message.member.roles.add(GHOSTS_ROLE_ID).catch(() => {
              logger.error("This role does not exist in the server.");
            });
          }
          this.nickEmojiAdd(message.member);
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
                  `${commandDoesntExistString}\nThere's this however ${highlight(config.prefix + closestCommand.usage)}`
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
                if (command.requiresProcessing) clearTyping();
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
