import { GuildMember } from "discord.js";
import { defineCommand } from "../../types";
import { SlashCommandBuilder } from '@discordjs/builders';

export default defineCommand({
  data: new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kick a user")
  .addUserOption(option => option
    .setName('user')
    .setDescription("the user to kick")
    .setRequired(true)),
  execute: async (interaction) => {
    const targetUser = interaction.options.getUser("user", true);
    const targetMember = interaction.guild?.members.cache.get(targetUser.id);

    if (!targetUser) return "please mention the user you wanna kick";
    if (!targetMember) return "member not found";
    if (!(interaction.member as GuildMember)?.permissions.has("KICK_MEMBERS")) return "you don't have perms cunt";

    // Kick him
    await targetMember.kick();

    // Get fucked
    return `Kicked user <@${targetUser.id}>`;
  },
});
