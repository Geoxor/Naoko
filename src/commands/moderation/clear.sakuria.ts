import { DiscordAPIError, GuildMember, TextChannel } from "discord.js";
import { defineCommand } from "../../types";
import { SlashCommandBuilder } from '@discordjs/builders';

export default defineCommand({
  data: new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Bulk delete messages up to 100")
  .addIntegerOption(option => option
    .setName('amount')
    .setDescription("the amount of messages to delete")
    .setRequired(true)),
  execute: async (interaction) => {
    if (!(interaction.member as GuildMember)?.permissions.has("MANAGE_MESSAGES")) return "you don't have perms cunt";
    let count = interaction.options.getInteger("amount", true) + 1;
    count = count > 100 ? 100 : count;
    // Will return if count is not a string.

    try {
      await (interaction.channel as TextChannel).bulkDelete(count);
      return `Cleared ${count} messages!`;
    } catch (error) {
      const err = error as DiscordAPIError;
      return err.message;
    }
  },
});
