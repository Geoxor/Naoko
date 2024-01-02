import { DiscordAPIError, EmbedBuilder, Message, TextBasedChannel, codeBlock } from "discord.js";
import AbstractPipelineElement from "../../AbstractPipelineElement";
import MessageCreatePayload from "../MessageCreatePayload";
import { singleton } from "tsyringe";
import { CommandExecuteResponse } from "../../../types";
import Logger from "../../../naoko/Logger";

@singleton()
export default class ExecuteCommand extends AbstractPipelineElement {
  constructor(private logger: Logger) {
    super();
  }

  private typingLocks: Map<string, ReturnType<typeof setInterval>> = new Map();

  async execute(payload: MessageCreatePayload) {
    const message = payload.get("message");
    const command = payload.get("command");
    const commandData = command.commandData;
    const timeStart = Date.now();

    // Check permissions
    if (commandData.permissions && message.inGuild()) {
      for (const perm of commandData.permissions) {
        if (!message.member?.permissions.has(perm)) {
          await message.reply(`You don't have the \`${perm}\` perm cunt`).catch(() => {});
          return `"${message.member?.displayName}" does not have permission to execute "${commandData.name}", missing "${perm}"`;
        }
      }
    }

    let processingMessage, typingLock;
    if (commandData.requiresProcessing) {
      [processingMessage, typingLock] = await this.startTyping(message.channel);
    }

    let result: CommandExecuteResponse | undefined;
    try {
      result = await command.execute(payload);
    } catch (error: any) {
      this.logger.error(`Command ${commandData.name} failed to execute with error: ${error}`);
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
    this.logger.print(
      `${executionTime}ms - Command: ${commandData.name} - User: ${message.author.username} - Guild: ${
        message.guild?.name || "dm"
      }`,
    );

    // If the command returns void we just return
    if (!result) {
      return true;
    }

    try {
      if (result instanceof EmbedBuilder) {
        result = { embeds: [result] };
      }
      await message.reply(result);
    } catch (error) {
      if ((error as DiscordAPIError).code === 500) {
        await message.reply({
          embeds: [new EmbedBuilder().setColor("#ffcc4d").setDescription("⚠️ when the upload speed")],
        });
        return "Failed to reply to user: Discord API status code 500";
      }
      await message.reply(codeBlock(String(error)));
      return `Failed to reply to user: ${error}`;
    }

    return true;
  }

  private async startTyping(channel: TextBasedChannel): Promise<[Message, NodeJS.Timer]> {
    const globalLock = this.typingLocks.get(channel.id);
    if (globalLock) {
      clearInterval(globalLock);
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

    try {
      await processingMessage.delete();
    } catch {}

    const globalLock = this.typingLocks.get(processingMessage.channel.id);
    if (globalLock === typingLock) {
      // HACK: somehow the typingLock got broken and not entirely clear why
      clearInterval(typingLock as any);
      this.typingLocks.delete(processingMessage.channel.id);
    }
  }
}
