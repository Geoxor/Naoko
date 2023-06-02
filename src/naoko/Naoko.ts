import Discord, { ChannelType, GuildTextBasedChannel, Partials } from "discord.js";
import packageJson from "../../package.json" assert { type: 'json' };
import welcomeMessages from "../assets/welcome_messages.json" assert { type: 'json' };
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
import { userMiddleware } from "../middleware/userMiddleware";
import { DISCORD_EVENTS, Plugin } from "./Plugin";
import { config } from "./Config";
import { User } from "./Database";
import { logger } from "./Logger";
import { GatewayIntentBits } from 'discord.js';
import { singleton } from '@triptyk/tsyringe';
import CommandManager from '../commands/CommandManager';
import { PluginManager } from "../plugins/PluginManager";

/**
 * Naoko multi purpose Discord bot
 * @author Geoxor, Cimok
 */
@singleton()
export default class Naoko {
  public static version = packageJson.version;

  public static bot: Discord.Client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessageTyping,
    ],
    partials: [Partials.Channel],
  });

  constructor(
    private commandManager: CommandManager,
    private pluginManager: PluginManager,
  ) {}

  public async run(): Promise<void> {
    await this.registerEventListener();
    this.pluginManager.registerEventListener(this.bot);

    logger.print("Naoko logging in...");
    await Naoko.bot.login(config.token);
  }

  private async registerEventListener() {
    Naoko.bot.on("guildMemberRemove", (member) => {
      // TODO: Magic number to Constant
      const channel = Naoko.bot.channels.cache.get("823403109522866217");
      if (channel && channel.type === ChannelType.GuildText) {
        channel.send(`User ${member.user.username}#${member.user.discriminator} left the server`).catch();
      }
    });
    Naoko.bot.on("voiceStateUpdate", (oldState, newState) => {
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
    Naoko.bot.on("ready", () => {
      logger.print(`Logged in as ${Naoko.bot.user!.tag}!`);
      logger.print(`Currently in ${Naoko.bot.guilds.cache.size} servers`);
      this.updateActivity();
      this.joinThreads();
    });
    Naoko.bot.on("messageCreate", async (message) => {
      // TODO: Make this automatically pass EVERY event to all the plugins instead of only here
      try {
        this.onMessageCreate(message);
      } catch (error) {
        console.log(error);
      }
    });
    Naoko.bot.on("messageDelete", async (message) => {
      if (message.guild?.id === GEOXOR_GUILD_ID) {
        logDelete(message);
      }
    });
    Naoko.bot.on("messageUpdate", async (oldMessage, newMessage) => {
      logEdit(oldMessage, newMessage, (oldMessage, newMessage) => { });
      userMiddleware(newMessage as Discord.Message, (newMessage) => {
        moderationMiddleware(newMessage, (newMessage) => { });
      });
    });
    Naoko.bot.on("guildMemberRemove", async (member) => {
      if (member.id === SHAII_ID) return;
      const user = await User.findOneOrCreate(member);
      user.updateRoles(Array.from(member.roles.cache.keys()));
    });
    Naoko.bot.on("guildMemberAdd", async (member) => {
      if (member.guild.id === GEOXOR_GUILD_ID) {
        await member.roles.add(GHOSTS_ROLE_ID);

        const generalChannel = await member.guild.channels.cache.get(GEOXOR_GENERAL_CHANNEL_ID);
        if (generalChannel && generalChannel.isTextBased()) {
          const welcomeMessage = randomChoice(welcomeMessages).replace(/::GUILD_NAME/g, member.guild.name);
          const message = await generalChannel.send(`<@${member.id}> ${welcomeMessage}`);
          await message.react("👋");
        }
      }

      let user = await User.findOneOrCreate(member);
      const addedRoles: string[] = [];
      for (const roleId of user.roles) {
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
          try {
            await member.roles.add(role);
            addedRoles.push(role.name);
          } catch(error) {
            console.log(`Could not give member old role: "${role.name}"`, error);
          }
        }
      }
      if (addedRoles.length > 0) {
        logger.print(`Added ${addedRoles.length} old roles to ${member.displayName}. List: ${addedRoles.join(', ')}`);
      }
    });
    Naoko.bot.on("presenceUpdate", async (oldPresence, newPresence) => {
      // Get their custom status
      const newStatus = newPresence.activities.find((activity) => activity.type === Discord.ActivityType.Custom)?.state;
      const oldStatus = oldPresence?.activities.find((activity) => activity.type === Discord.ActivityType.Custom)?.state;

      if (!newStatus || !newPresence.user) return;

      // This stops it from acting when the user's status updates for another reason such as
      // spotify changing tunes or not, we don't care about those events we just care
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
    Naoko.bot.on("guildMemberUpdate", async (oldMember, newMember) => {
      if (oldMember.user.username !== newMember.user.username) {
        logger.print(`Updated username history for ${oldMember.id} '${newMember.user.username}'`);
        User.pushHistory("username_history", oldMember.id, newMember.user.username);
      }
      if (oldMember.nickname !== newMember.nickname && newMember.nickname) {
        logger.print(`Updated nickname history for ${oldMember.id} '${newMember.nickname}'`);
        User.pushHistory("nickname_history", oldMember.id, newMember.nickname);
      }
    });
    Naoko.bot.on("threadCreate", (thread) => {
      thread.join();
    });
  }

  public hasGhostRole(member: Discord.GuildMember): boolean {
    return member.roles.cache.has("736285344659669003");
  }

  private updateActivity() {
    Naoko.bot.user?.setActivity(`${config.prefix}help v${packageJson.version}`, { type: Discord.ActivityType.Listening });
  }

  private async joinThreads() {
    const channels = Naoko.bot.channels.cache.values();
    for (const channel of channels) {
      if (channel.isThread()) {
        if (channel.ownerId === SHAII_ID) {
          await channel.delete();
          logger.print(`Deleted residual battle thread ${channel.id}`)
          continue;
        }

        await channel.join();
        logger.print(`Joined thread ${channel.id}`);
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
            const command = this.commandManager.getCommand(message.command);

            const clearTyping = () => {
              if (processingMessage) {
                processingMessage.delete().catch(() => { });
                // @ts-ignore
                clearInterval(typingInterval);
              }
            };

            // If it doesn't exist we respond
            if (!command) {
              const closestCommand = this.commandManager.getClosestCommand(message.command);
              if (closestCommand) {
                return message
                  .reply(
                    "That command doesn't exist!\n" +
                    `There's this however ${highlight(config.prefix + closestCommand.commandData.usage)}`
                  );
              }

              return message.reply("That command doesn't exist");
            }

            const commandData = command?.commandData;

            // Notify the user their shit's processing
            if (commandData.requiresProcessing) {
              var processingMessage = await message.channel.send("Processing...").catch(() => { });
              var typingInterval = setInterval(() => message.channel.sendTyping(), 4000);
            }

            // Check permissions
            if (commandData.permissions) {
              for (const perm of commandData.permissions) {
                if (!message.member?.permissions.has(perm)) {
                  if (commandData.requiresProcessing) clearTyping();
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
                `${timeEnd - timeStart}ms - Executed command: ${commandData.name} - User: ${message.author.username} - Guild: ${message.guild?.name || "dm"
                }`
              );
            } catch (error: any) {
              logger.error(`Command ${commandData.name} failed to execute with error: ${error}`);
              console.error(error);
              await message.reply({
                 embeds:[
                    {
                        title: ":warning: Something went wrong while executing this command",
                        description: `Looks like something isn't right. Please try again, and if the problem persists, please let us know in a [github issue](https://github.com/Geoxor/Naoko/issues). \n\n Error: \`\`\`${error}\`\`\``,
                        color: 0xff0000
                    }
                 ]
              });
            }

            // Delete the processing message if it exists
            clearTyping();

            // If the command returns void we just return
            if (!result) return;

            // Send the result
            message
              .reply(result)
              .catch(() =>  {
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
