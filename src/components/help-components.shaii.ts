import { SelectMenuInteraction, MessageEmbed, Permissions, PermissionString } from 'discord.js';
import { randomChoice } from "src/logic/logic.shaii";
import { COMMAND_CATEGORIES_RAW, SLURS } from "src/constants";
import shaii from "../shaii/Shaii.shaii";

export function executeHelpComponents(interaction: SelectMenuInteraction): void {
  const categoryMap: Map<string, MessageEmbed> = new Map(
    COMMAND_CATEGORIES_RAW.map((label) => [
      label.toLowerCase(),
      new MessageEmbed({
        title: `All ${label} commands:`,
        description: shaii.commands
          .filter(command => command.category === label)
          .map(command => `> ${pickExecutableEmoji(interaction.member!.permissions, command.permissions)} **${command.name}**:` +
            ` ${command.description}\n${command.aliases ? `aliases: ${command.aliases.join(', ')}` : ''}`)
          .join('\n'),
        color: 'LUMINOUS_VIVID_PINK',
      }),
    ]),
  );

  const helpEmbed = categoryMap.get(interaction.values[0]);

  if (helpEmbed) {
    if (interaction.user.id !== interaction!.message.components[0].components[0].custom_id) {
      interaction.reply({
        content: `This ain't your help message you ${randomChoice(SLURS)}`,
        ephemeral: true,
      });
    } else {
      interaction.update({ embeds: [helpEmbed] });
    }
  }
}

function pickExecutableEmoji(memberPermission: Permissions, commandRequiredPermission: PermissionString): string {
  return memberPermission.has(commandRequiredPermission) ? '✅' : '❌';
}
