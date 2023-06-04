import { DiscordAPIError, EmbedBuilder, Message, TextBasedChannel } from "discord.js";
import AbstractPipelineElement from "../../AbstractPipelineElement";
import MessageCreatePayload from "../MessageCreatePayload";
import { logger } from "../../../naoko/Logger";
import { singleton } from "@triptyk/tsyringe";
import { CommandExecuteResponse, IMessage } from "../../../types";

@singleton()
export default class ExecuteCommand extends AbstractPipelineElement {
  private typingLocks: Map<string, NodeJS.Timer> = new Map()

  async execute(payload: MessageCreatePayload): Promise<boolean> {
    const message = payload.get('message');
    const command = payload.get('comand');
    const commandData = command.commandData;
    const timeStart = Date.now();

    // Check permissions
    if (commandData.permissions && message.inGuild()) {
      for (const perm of commandData.permissions) {
        if (!message.member?.permissions.has(perm)) {
          await message.reply(`You don't have the \`${perm}\` perm cunt`).catch(() => { });
          return false;
        }
      }
    }

    let processingMessage, typingLock;
    if (commandData.requiresProcessing) {
      [processingMessage, typingLock] = await this.startTypeing(message.channel);
    }

    let result: CommandExecuteResponse | undefined;
    try {
      result = await command.execute(payload);
    } catch (error: any) {
      logger.error(`Command ${commandData.name} failed to execute with error: ${error}`);
      console.error(error);
      await message.reply({
        embeds: [
          {
            title: ":warning: Something went wrong while executing this command",
            description: `Looks like something isn't right. Please try again, and if the problem persists, please let us know in a [github issue](https://github.com/Geoxor/Naoko/issues). \n\n Error: \`\`\`${error}\`\`\``,
            color: 0xff0000,
          },
        ],
      });
    }

    await this.clearTyping(processingMessage, typingLock);

    const executionTime = Date.now() - timeStart;
    logger.print(
      `${executionTime}ms - Command: ${commandData.name} - User: ${message.author.username} - Guild: ${message.guild?.name || "dm"}`
    );

    // If the command returns void we just return
    if (!result) {
      return true;
    }

    try {
      await message.reply(result);
    } catch (error) {
      if ((error as DiscordAPIError).code === 500) {
        await message.reply({
          embeds: [new EmbedBuilder().setColor("#ffcc4d").setDescription("⚠️ when the upload speed")],
        })
        return false;
      }
      await message.reply('```' + error + '```');
      return false;
    }

    return true;
  }

  private async startTypeing(channel: TextBasedChannel): Promise<[Message, NodeJS.Timer]> {
    if (this.typingLocks.has(channel.id)) {
      clearInterval(channel.id);
      this.typingLocks.delete(channel.id);
    }

    const processingMessage = await channel.send("Processing...");
    await channel.sendTyping();
    const typingLock = setInterval(() => channel.sendTyping(), 4000);
    this.typingLocks.set(channel.id, typingLock);

    return [processingMessage, typingLock];
  }

  private async clearTyping(processingMessage?: Message, typingLock?: NodeJS.Timer): Promise<void> {
    if (!processingMessage || !typingLock) {
      return;
    }

    await processingMessage.delete();

    const globalLock = this.typingLocks.get(processingMessage.channel.id);
    if (globalLock === typingLock) {
      clearInterval(typingLock);
      this.typingLocks.delete(processingMessage.channel.id);
    }
  }
}
