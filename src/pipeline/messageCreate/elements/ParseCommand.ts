import { MessageMentions } from "discord.js";
import AbstractPipelineElement from "../../AbstractPipelineElement";
import MessageCreatePayload from "../MessageCreatePayload";
import Config from "../../../naoko/Config";
import { singleton } from "tsyringe";
import { PluginManager } from "../../../plugins/PluginManager";

@singleton()
export default class ParseCommand extends AbstractPipelineElement {
  constructor(
    private pluginManager: PluginManager,
    private config: Config,
  ) {
    super();
  }

  async execute(payload: MessageCreatePayload) {
    const message = payload.get("message");
    if (message.content.lastIndexOf(this.config.prefix) !== 0 || message.author.bot) {
      return message.author.bot ? "Message was sent by a bot" : "Message did not start with the prefix";
    }

    // Remove all Mentions -> Remove the Prefix -> Split the message on every whitespace
    const args = this.removeMentions(message.content).slice(this.config.prefix.length).trim().split(/ +/);
    const commandName = args.shift() || "";

    const command = this.pluginManager.getCommand(commandName);
    if (!command) {
      const closestCommand = this.pluginManager.getClosestCommand(commandName);
      if (closestCommand) {
        await message.reply(
          "That command doesn't exist!\n" +
            `There's this however \`${this.config.prefix}${closestCommand.commandData.name} ${closestCommand.commandData.usage}\``,
        );
      } else {
        await message.reply("That command doesn't exist");
      }

      return `Command "${command}" not found`;
    }

    payload.set("args", args);
    payload.set("commandName", commandName);
    payload.set("command", command);

    return true;
  }

  removeMentions(messageContent: string): string {
    return messageContent
      .replace(MessageMentions.ChannelsPattern, "")
      .replace(MessageMentions.EveryonePattern, "")
      .replace(MessageMentions.RolesPattern, "")
      .replace(MessageMentions.UsersPattern, "");
  }
}
