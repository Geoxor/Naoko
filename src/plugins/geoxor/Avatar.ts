import plugin from "../../decorators/plugin";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import { CommandExecuteResponse } from "../../types";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import AbstractCommand, { CommandData } from "../AbstractCommand";

class AvatarCommand extends AbstractCommand {
  public execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const message = payload.get('message');
    const args = payload.get('args');

    const otherUser = message.mentions.users.first() || message.client.users.cache.get(args[0]) || message.author;
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
      usage: "[<@user> | <user-id>]",
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

