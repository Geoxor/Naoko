import plugin from "../../decorators/plugin";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import AbstractCommand, { CommandData } from "../../commands/AbstractCommand";
import { IMessage, CommandExecuteResponse } from "../../types";

class AvatarCommand extends AbstractCommand {
  public execute(message: IMessage): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const otherUser = message.mentions.users.first() || message.client.users.cache.get(message.args[0]) || message.author;
    let avatar;

    if (message.guild) {
      const member = message.guild.members.cache.get(otherUser.id);
      if (member && member.avatar) avatar = member.avatarURL({ size: 256 });
    }
    return avatar || otherUser.displayAvatarURL({ size: 256 });
  }

  public get commandData(): CommandData {
    return {
      name: "avatar",
      category: "UTILITY",
      usage: "avatar <@user | user_id>",
      description: "Get the avatar of a user or yours",
    };
  }
}

@plugin()
class Avatar extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@geoxor/avatar",
      version: "1.0.0",
      commands: [AvatarCommand],
    };
  }
}

