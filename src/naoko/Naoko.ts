import Discord, { ChannelType, GuildTextBasedChannel, Partials } from "discord.js";
import packageJson from "../../package.json" assert { type: 'json' };
import welcomeMessages from "../assets/welcome_messages.json" assert { type: 'json' };
import {
  GEOXOR_GENERAL_CHANNEL_ID,
  GEOXOR_GUILD_ID,
  GHOSTS_ROLE_ID,
  SHAII_ID,
} from "../constants";
import { randomChoice } from "../logic/logic";
import { logDelete, logEdit } from "../middleware/messageLoggerMiddleware";
import { config } from "./Config";
import { User } from "./Database";
import { logger } from "./Logger";
import { GatewayIntentBits } from 'discord.js';
import { singleton } from '@triptyk/tsyringe';
import { PluginManager } from "../plugins/PluginManager";
import MessageCreatePipelineManager from "../pipeline/messageCreate/MessageCreatePipelineManager";

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
    private pluginManager: PluginManager,
    private messageCreatePipeline: MessageCreatePipelineManager,
  ) {}

  public async run(): Promise<void> {
    await this.registerEventListener();
    this.pluginManager.registerEventListener(Naoko.bot);

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
      // TODO: Move this into a logging Plugin
      const LOG_CHANNEL = "755597803102928966"; // magic number to constant
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
      await this.messageCreatePipeline.handleMessageCreate(message);
    });
    Naoko.bot.on("messageDelete", async (message) => {
      // TODO: Refactor this to Loggin plugin
      if (message.guild?.id === GEOXOR_GUILD_ID) {
        logDelete(message);
      }
    });
    Naoko.bot.on("messageUpdate", async (oldMessage, newMessage) => {
      // TODO: Refactor this to Loggin plugin
      logEdit(oldMessage, newMessage, () => { });
      // TODO: Refactor this to Modaration plugin, It should do the same spam check
      //userMiddleware(newMessage as Discord.Message, (newMessage) => {
        //moderationMiddleware(newMessage, (newMessage) => { });
      //});
    });
    Naoko.bot.on("guildMemberRemove", async (member) => {
      // TODO: Refactor this to memorise role plugin
      if (member.id === SHAII_ID) return;
      const user = await User.findOneOrCreate(member);
      user.updateRoles(Array.from(member.roles.cache.keys()));
    });
    Naoko.bot.on("guildMemberAdd", async (member) => {
      // TODO: Refactor this to moderation role plugin
      if (member.guild.id === GEOXOR_GUILD_ID) {
        await member.roles.add(GHOSTS_ROLE_ID);

        const generalChannel = member.guild.channels.cache.get(GEOXOR_GENERAL_CHANNEL_ID);
        if (generalChannel && generalChannel.isTextBased()) {
          const welcomeMessage = randomChoice(welcomeMessages).replace(/::GUILD_NAME/g, member.guild.name);
          const message = await generalChannel.send(`<@${member.id}> ${welcomeMessage}`);
          await message.react("👋");
        }
      }

      // TODO: Refactor this to memorise role plugin
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
      // TODO: Refactor this to Loggin plugin
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
      // TODO: Refactor this to Loggin plugin
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
      // TODO: Refactor this to Moderation plugin
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
        // TODO: This was part of the Waifu battles. It can either be deleted 
        // or refactored in its one plugin, if we want the battle things again. I kinda liked them
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
}
