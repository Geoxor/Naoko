import { MessageMentions } from "discord.js";
import AbstractPipelineElement from "../../AbstractPipelineElement";
import MessageCreatePayload from "../MessageCreatePayload";
import { config } from "../../../naoko/Config";
import { singleton } from "@triptyk/tsyringe";
import { PluginManager } from "../../../plugins/PluginManager";

@singleton()
export default class ParseCommand extends AbstractPipelineElement {
  constructor(
    private pluginManager: PluginManager,
  ) {
    super();
  }

  async execute(payload: MessageCreatePayload): Promise<boolean> {
    const message = payload.get('message');
    if (message.content.lastIndexOf(config.prefix) !== 0 || message.author.bot) {
      return false;
    }

    // Remove all Mentions -> Remove the Prefix -> Split the message on every whitespace
    const args = this.removeMentions(message.content).slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift() || '';

    const command = this.pluginManager.getCommand(commandName);
    if (!command) {
      const closestCommand = this.pluginManager.getClosestCommand(commandName);
      if (closestCommand) {
        await message
          .reply(
            "That command doesn't exist!\n" +
            `There's this however \`${config.prefix + closestCommand.commandData.usage}\``
          );
        return false;
      }

      await message.reply("That command doesn't exist");
      return false;
    }

    payload.set('args', args);
    payload.set('commandName', commandName);
    payload.set('comand', command);

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
