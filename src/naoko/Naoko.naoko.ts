import Discord, { ChannelType, GatewayIntentBits, GuildTextBasedChannel, Partials, TextChannel } from "discord.js";
import fs from "fs";
import levenshtein from "js-levenshtein";
import path from "path";
import si from "systeminformation";
import packageJson from "../../package.json" assert { type: 'json' };
import welcomeMessages from "../assets/welcome_messages.json" assert { type: 'json' };
import { getCommands } from "../commands";
import {
  GEOXOR_GENERAL_CHANNEL_ID,
  GEOXOR_GUILD_ID,
  GHOSTS_ROLE_ID,
  SHAII_ID,
} from "../constants";
import { highlight, markdown, randomChoice } from "../logic/logic";
import commandMiddleware from "../middleware/commandMiddleware";
import { logDelete, logEdit } from "../middleware/messageLoggerMiddleware";
import moderationMiddleware from "../middleware/moderationMiddleware";
import restrictedChannelMiddleware from "../middleware/restrictedChannelMiddleware";
import { giveGhostsRole, hasGhostsRole, userMiddleware } from "../middleware/userMiddleware";
import { DISCORD_EVENTS, Plugin } from "./Plugin";
import { ICommand } from "../types";
import { config } from "./Config";
import { User } from "./Database";
import { logger } from "./Logger";
import { fileURLToPath } from 'node:url';

export let systemInfo: si.Systeminformation.StaticData;
logger.print("Fetching environment information...");
si.getStaticData().then((info) => {
  logger.print("Environment info fetched");
  systemInfo = info;
});

/**
 * Naoko multi purpose Discord bot
 * @author Geoxor, Cimok
 */
class Naoko {
  public commands: Discord.Collection<string, ICommand> = new Discord.Collection();
  public geoxorGuild: Discord.Guild | undefined;
  public plugins: Plugin[] = [];
  public bot: Discord.Client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessageTyping
    ],
    partials: [Partials.Channel],
  });
  constructor() {
    this.loadPlugins();
    this.loadCommands();
    for (const event of DISCORD_EVENTS) {
      this.bot.on(event as string, (data) => {
        this.plugins.forEach((plugin) => plugin.send(event, [data]));
      });
    }
    this.bot.on("guildMemberRemove", (member) => {
      const channel = this.geoxorGuild?.channels.cache.get("823403109522866217");
      if (channel && channel.type === ChannelType.GuildText) {
        channel.send(`User ${member.user.username}#${member.user.discriminator} left the server`).catch();
      }
    });
    this.bot.on("voiceStateUpdate", (oldState, newState) => {
      const LOG_CHANNEL = "755597803102928966";
      const pingVoiceChannel = (channelId: string) => `<#${channelId}>`;

      const logChannel = newState.guild.channels.cache.get(LOG_CHANNEL) as GuildTextBasedChannel;
      if (!logChannel) return;

      const member = oldState.member || newState.member;
      if (!member) return;
      if (member.user.bot) return;

      if (!oldState?.channelId && newState?.channelId) {
        logChannel.send(`User: ${member.displayName} joined ${pingVoiceChannel(newState.channelId)}`).then((message) => {
          message.edit(`User: <@${member.id}> joined ${pingVoiceChannel(newState.channelId!)}`).catch();
        }).catch();
      }

      if ((oldState?.channelId && newState?.channelId) && oldState?.channelId !== newState?.channelId) {
        logChannel.send(`User: ${member.displayName} moved from ${pingVoiceChannel(oldState.channelId)} => ${pingVoiceChannel(newState.channelId)}`).then((message) => {
          message.edit(`User: <@${member.id}> moved from ${pingVoiceChannel(oldState.channelId!)} => ${pingVoiceChannel(newState.channelId!)}`).catch();
        }).catch();
      }

      if (oldState?.channelId && !newState?.channelId) {
        logChannel.send(`User: ${member.displayName} left ${pingVoiceChannel(oldState.channelId)}`).then((message) => {
          message.edit(`User: <@${member.id}> left ${pingVoiceChannel(oldState.channelId!)}`).catch();
        }).catch();
      }
    });

    this.bot.on("ready", () => {
      logger.print("Instantiated Discord client instance");
      logger.print(`Logged in as ${this.bot.user!.tag}!`);
      logger.print(`Currently in ${this.bot.guilds.cache.size} servers`);
      this.updateActivity();
      this.joinThreads();
      this.geoxorGuild = this.bot.guilds.cache.get(GEOXOR_GUILD_ID);
    });
    this.bot.on("messageCreate", async (message) => {
      // TODO: Make this automatically pass EVERY event to all the plugins instead of only here
      try {
        this.onMessageCreate(message);
      } catch (error) {
        console.log(error);
      }
    });
    this.bot.on("messageDelete", async (message) => {
      if (message.guild?.id === GEOXOR_GUILD_ID) {
        logDelete(message);
      }
    });
    this.bot.on("messageUpdate", async (oldMessage, newMessage) => {
      logEdit(oldMessage, newMessage, (oldMessage, newMessage) => { });
      userMiddleware(newMessage as Discord.Message, (newMessage) => {
        moderationMiddleware(newMessage, (newMessage) => { });
      });
    });
    this.bot.on("guildMemberRemove", async (member) => {
      if (member.id === SHAII_ID) return;
      let user = await User.findOneOrCreate(member);
      user.updateRoles(Array.from(member.roles.cache.keys()));
    });
    this.bot.on("guildMemberAdd", async (member) => {
      if (member.guild.id === GEOXOR_GUILD_ID) {
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
      const newStatus = newPresence.activities.find((activity) => activity.type === Discord.ActivityType.Custom)?.state;
      const oldStatus = oldPresence?.activities.find((activity) => activity.type === Discord.ActivityType.Custom)?.state;

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
    logger.print("Naoko logging in...");
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

    // Get commands from built-in commands
    const commandSources = await getCommands();

    // Get commands from plugins
    const pluginCommands = this.plugins.map((plugin) => plugin.command).filter((plugin) => !!plugin) as (
      | ICommand
      | ICommand[]
    )[];

    // Iterate through each plugin
    for (let i = 0; i < pluginCommands.length; i++) {
      const command = pluginCommands[i];

      // If theres multiple commands in 1 plugin add each
      if (command instanceof Array) {
        command.forEach((command) => commandSources.push(command));
        continue;
      }

      // Else add the single command
      commandSources.push(command);
    }

    // Register the commands
    for (const command of commandSources) {
      this.commands.set(command.name, command);
      logger.print(`┖ Imported command ${command.name}`);
    }
  }

  private async loadPlugins() {
    const absolutePath = fileURLToPath(new URL('../plugins', import.meta.url));
    console.log(absolutePath);
    const pluginPromises = fs
      .readdirSync(absolutePath)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => import(path.join("../plugins/" + file)));
    this.plugins = await Promise.all(pluginPromises);
  }

  private updateActivity() {
    this.bot.user?.setActivity(`${config.prefix}help v${packageJson.version}`, { type: Discord.ActivityType.Listening });
  }

  private joinThreads() {
    const channels = this.bot.channels.cache.values();
    for (let channel of channels) {
      if (channel.isThread()) {
        if (channel.ownerId === SHAII_ID) {
          channel
            .delete()
            .then(() => logger.print(`Deleted residual battle thread ${channel.id}`))
            .catch(() => { });
          continue;
        }
        channel.join().then(() => logger.print(`Joined thread ${channel.id}`));
      }
    }
  }

  private onMessageCreate(message: Discord.Message) {
    userMiddleware(message, (message) => {
      moderationMiddleware(message, (message) => {
        // If some users joined while legacy Naoko was kicked, adds to them the ghost role if they talk in chat
        if (message.member && message.guild?.id === GEOXOR_GUILD_ID) {
          if (!this.hasGhostRole(message.member)) {
            message.member.roles.add(GHOSTS_ROLE_ID).catch(() => {
              logger.error("This role does not exist in the server.");
            });
          }
        }

        // For channels that have "images" in their name we simply force delete any messages that don't have that in there
        if (
          message.guild?.channels.cache.get(message.channel.id)?.name.includes("images") &&
          message.attachments.size === 0
        )
          return message.delete().catch(() => { });

        restrictedChannelMiddleware(message, (message) => {
          commandMiddleware(message, async (message) => {
            const command =
              this.commands.get(message.command) ||
              this.commands.find((command) => command.aliases.includes(message.command));

            const clearTyping = () => {
              if (processingMessage) {
                processingMessage.delete().catch(() => { });
                // @ts-ignore
                clearInterval(typingInterval);
              }
            };

            // If it doesn't exist we respond
            if (!command) {
              const commandDoesntExistString = `That command doesn't exist`;
              const closestCommand = this.getClosestCommand(message.command);

              if (closestCommand)
                return message
                  .reply(
                    `${commandDoesntExistString}\nThere's this however ${highlight(config.prefix + closestCommand.usage)}`
                  )
                  .catch(() => { });

              return message.reply(`${commandDoesntExistString}`).catch(() => { });
            }

            // Notify the user their shit's processing
            if (command.requiresProcessing) {
              var processingMessage = await message.channel.send("Processing...").catch(() => { });
              var typingInterval = setInterval(() => message.channel.sendTyping(), 4000);
            }

            // Check permissions
            if (command.permissions) {
              for (const perm of command.permissions) {
                if (!message.member?.permissions.has(perm)) {
                  if (command.requiresProcessing) clearTyping();
                  return message.reply(`You don't have the \`${perm}\` perm cunt`).catch(() => { });
                }
              }
            }

            // Get the result to send from the command
            try {
              let timeStart = Date.now();
              var result = await command.execute(message);
              let timeEnd = Date.now();
              logger.print(
                `${timeEnd - timeStart}ms - Executed command: ${command.name} - User: ${message.author.username} - Guild: ${message.guild?.name || "dm"
                }`
              );
            } catch (error: any) {
              await message.reply(markdown(error)).catch(() => { });
            }

            // Delete the processing message if it exists
            clearTyping();

            // If the command returns void we just return
            if (!result) return;

            // Send the result
            message
              .reply(result)
              .catch(() => {
                message.channel.send(result!)
                  .catch((error) =>
                    error.code === 500
                      ? message.reply({
                        embeds: [new Discord.EmbedBuilder().setColor("#ffcc4d").setDescription("⚠️ when the upload speed")],
                      })
                      : message.reply(markdown(error))
                  );
              });
          });
        });
      });
    });
  }
}

export default new Naoko();
