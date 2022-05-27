import { GuildTextBasedChannel } from "discord.js";
import { definePlugin } from "../shaii/Plugin.shaii";

const LOG_CHANNEL = "755597803102928966";

const pingVoiceChannel = (channelId: string) => `<#${channelId}>`;

export default definePlugin({
  name: "@geoxor/voice-chat-logger",
  version: "1.0.0",
  events: {
    voiceStateUpdate: (oldState, newState) => {
      const logChannel = newState.guild.channels.cache.get(LOG_CHANNEL) as GuildTextBasedChannel;
      if (!logChannel) return;

      const member = oldState.member || newState.member;
      if (!member) return;

      if (oldState.channelId !== newState.channelId) {
        logChannel.send(`User: ${member.displayName} changed voice channel from ${pingVoiceChannel(oldState.channelId)} => ${pingVoiceChannel(newState.channelId)}`).catch(console.error);
      }

      if (!oldState.channelId && newState.channelId) {
        logChannel.send(`User: ${member.displayName} joined voice channel ${pingVoiceChannel(newState.channelId)}`).catch(console.error);
      }

      if (oldState.channelId && !newState.channelId) {
        logChannel.send(`User: ${member.displayName} left voice channel ${pingVoiceChannel(oldState.channelId)}`).catch(console.error);
      }
    },
  },
});
