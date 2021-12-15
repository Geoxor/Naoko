import { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';
import { defineCommand } from "../../types";
import { COMMAND_CATEGORIES } from "src/constants";

const selectOptions: MessageSelectOptionData[] = COMMAND_CATEGORIES
  .map(([label, emoji]) => ({
    label,
    value: label.toLowerCase(),
    description: `All ${label.toLowerCase().split('_').join(' ')} commands.`,
    emoji,
    default: false,
  }));

export default defineCommand({
  name: "help",
  category: "UTILITY",
  usage: "help",
  aliases: ["h"],
  description: "The command you just did",
  requiresProcessing: false,
  execute: (message) => {
    message.channel.send({
      embeds: [
        new MessageEmbed({
          title: 'All Shaii commands',
          description: 'Please s  elect one command category.',
          color: 'LUMINOUS_VIVID_PINK',
        }),
      ],
      components: [
        new MessageActionRow({
          components: [
            new MessageSelectMenu({
              customId: message.author.id,
              placeholder: '❔ Categories',
              options: selectOptions,
            }),
          ],
        }),
      ],
    });
  },
});
