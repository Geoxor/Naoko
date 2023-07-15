import { TextChannel, ComponentType, codeBlock, User, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import MessageCreatePayload from "../../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../../types";
import AbstractCommand, { CommandData } from "../../AbstractCommand";
import { singleton } from "@triptyk/tsyringe";

@singleton()
export class Clear extends AbstractCommand {
  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const args = payload.get("args");
    const message = payload.get("message");

    let count = Number(args[0]);
    if (isNaN(count) || count <= 1) {
      return `⚠️ ${args[0]} is not a valid number!`;
    }

    if (count > 100) {
      const confirmedClear = await this.confirmDelete(message.author, message.channel as TextChannel, count);
      if (confirmedClear !== true) {
        return confirmedClear;
      }
    }

    await this.doClear(count, message.channel as TextChannel);
  }

  private async doClear(count: number, channel: TextChannel) {
    let deletedCount = 0;
    try {
      // Count MUST be between 2 and 100
      while (count > 1) {
        const countToDelete = count > 100 ? 100 : count;
        const deleteResult = await channel.bulkDelete(countToDelete, true);
        deletedCount += deleteResult.size;
        if (deleteResult.size === 0 || deletedCount >= count) {
          break;
        }
      }
      await channel.send(`Cleared ${deletedCount} messages!`);
    } catch (error: any) {
      await channel.send(`An error occurred while deleting messages:\n${codeBlock(error.message || error)}`);
    }
  }

  private async confirmDelete(author: User, channel: TextChannel, count: number): Promise<true | string> {
    let authorMember;
    try {
      authorMember = await channel.guild.members.fetch(author);
    } catch {
      return 'Internal error: Could not fetch member for permission check';
    }

    if (!authorMember.permissions.has(PermissionFlagsBits.Administrator)) {
      return 'You need "Administrator" permission to delete more than 100 Messages at once!';
    }

    const confirmBtn = new ButtonBuilder()
      .setCustomId('confirm-clear')
      .setLabel('Yes, do as I say!')
      .setEmoji('⚠️')
      .setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(confirmBtn);

    const confirmMessage = await channel.send({
      content: `Do you really want to delete the last ${count} messages? (30s Timeout)`,
      // @ts-expect-error TODO: Fix me
      components: [row],
    });

    let executed = false;
    const collector = confirmMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30_000 });
    return new Promise((resolve) => {
      collector.on('collect', async (evt) => {
        if (evt.user.id !== author.id) {
          await evt.reply({ content: 'Only the original author can confirm this action!', ephemeral: true });
          return;
        }
        executed = true;
        resolve(true);
      });
      collector.on('end', async () => {
        if (executed) return;

        confirmBtn.setLabel('Timeout').setEmoji('⌛').setDisabled();
        const row = new ActionRowBuilder().addComponents(confirmBtn);
        // @ts-expect-error TODO: Fix me
        await confirmMessage.edit({ components: [row] });

        resolve('Confirmation timeout!');
      })
    })
  }

  get commandData(): CommandData {
    return {
      name: "clear",
      category: "MODERATION",
      usage: "<message-count>",
      description: "Bulk delete messages. Can delete all messages that are up to 2 weeks old",
      permissions: ["ManageMessages"],
      requiresProcessing: true,
    };
  }
}
