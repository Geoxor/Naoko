import Discord, { Client, Guild, GuildMember, Intents } from "discord.js";
import { MUTED_ROLE_ID, SELF_MUTED_ROLE_ID } from "../constants";
import { User } from "../shaii/Database.shaii";
import logger from "../shaii/Logger.shaii";
import { defineCommand } from "../types";
import { sendUnmuteEmbed } from "../commands/moderation/mute.shaii";
import { definePlugin } from "../shaii/Plugin.shaii";
import { GEOXOR_GUILD_ID } from "../constants";

const gm = defineCommand({
  name: "gm",
  category: "UTILITY",
  usage: "gm",
  description: "Unmute after using ~gn",
  execute: async (message) => {
    const guild = message.client.guilds.cache.get(GEOXOR_GUILD_ID);
    const member = await guild!.members.fetch(message.author.id);
    if (message.author) {
      if (message.channel.type == "DM" && hasSelfMute(member) && !hasActualMute(member)) {
        const targetUser = member;
        if (!targetUser) throw new Error("No User");

        // Unget rekt
        await targetUser.timeout(0);
        await unSelfMute(targetUser);

        // Keep track of the unmute
        await User.unmute(message.author.id, targetUser.id).catch(() => logger.error("Unmute database update failed"));

        // Send the embed
        sendUnmuteEmbed(message, targetUser);
        console.log;
      }
    }
  },
});

export function hasSelfMute(member: Discord.GuildMember): boolean {
  const guild = member.client.guilds.cache.get(GEOXOR_GUILD_ID);
  const guildMember = guild?.members.cache.get(member.id);
  return guildMember!.roles.cache.has(SELF_MUTED_ROLE_ID);
}

export function hasActualMute(member: Discord.GuildMember): boolean {
  const guild = member.client.guilds.cache.get(GEOXOR_GUILD_ID);
  const guildMember = guild?.members.cache.get(member.id);
  return guildMember!.roles.cache.has(MUTED_ROLE_ID);
}

export function unSelfMute(member: Discord.GuildMember): Promise<GuildMember> {
  const guild = member.client.guilds.cache.get(GEOXOR_GUILD_ID);
  const guildMember = guild?.members.cache.get(member.id);
  const role = guild?.roles.cache.find((role: { id: string }) => role.id === SELF_MUTED_ROLE_ID);
  return guildMember!.roles.remove(role!);
}

export default definePlugin({
  name: "@shkoop/goodmorning",
  version: "1.0.0",
  command: [gm],
});

