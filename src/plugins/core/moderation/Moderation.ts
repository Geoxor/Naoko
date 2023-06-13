import { AnyThreadChannel, GuildMember, Message, PartialMessage } from "discord.js";
import plugin from "../../../decorators/plugin";
import AbstractPlugin, { PluginData } from "../../AbstractPlugin";
import { Ban, Unban } from "./Ban";
import { Clear } from "./Clear";
import { Kick } from "./Kick";
import { Mute, Unmute } from "./Mute";
import { WhoIs } from "./Whois";
import { GEOXOR_GUILD_ID, GHOSTS_ROLE_ID, GEOXOR_GENERAL_CHANNEL_ID } from "../../../constants";
import welcomeMessages from "../../../assets/welcome_messages.json" assert { type: 'json' };
import CommonUtils from "../../../service/CommonUtils";
import SpamCheckService from "../../../service/SpamCheckService";
import Logger from "../../../naoko/Logger";

@plugin()
class Moderation extends AbstractPlugin {
  constructor(
    private commonUtils: CommonUtils,
    private spamChecker: SpamCheckService,
    private logger: Logger,
  ) {
    super()
  }

  public get pluginData(): PluginData {
    return {
      name: '@core/moderation',
      version: "1.0.0",
      commands: [Ban, Unban, Clear, Kick, Mute, Unmute, WhoIs],
      events: {
        guildMemberAdd: this.addGhostRole,
        threadCreate: this.autoJoinThreads,
        messageUpdate: this.checkUpdatedMessage,
      }
    }
  }

  private async addGhostRole(member: GuildMember) {
    if (member.guild.id !== GEOXOR_GUILD_ID) {
      return;
    }

    await member.roles.add(GHOSTS_ROLE_ID);
    const generalChannel = member.guild.channels.cache.get(GEOXOR_GENERAL_CHANNEL_ID);
    if (generalChannel && generalChannel.isTextBased()) {
      const welcomeMessage = this.commonUtils.randomChoice(welcomeMessages).replace(/::GUILD_NAME/g, member.guild.name);
      const message = await generalChannel.send(`<@${member.id}> ${welcomeMessage}`);
      await message.react("👋");
    }
  }

  private async autoJoinThreads(thread: AnyThreadChannel) {
    await thread.join();
  }

  private async checkUpdatedMessage(_oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
    const spamResult = this.spamChecker.checkForSpam(newMessage.content || '');
    if (spamResult.isSpam) {
      this.logger.error(`SpamCheck ${spamResult.failedCheck} failed for ${newMessage.author?.username}`);
      await newMessage.delete();
    }
  }
}
