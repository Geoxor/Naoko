import plugin from "../../decorators/plugin";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import { CommandExecuteResponse } from "../../types";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import AbstractCommand, { CommandData } from "../AbstractCommand";

class banner extends AbstractCommand {
  public async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get("message");
    const args = payload.get("args");
    
    let otherUser = message.mentions.users.first() || message.author;
    
    console.log(otherUser);
    try {
      console.log(await message.client.users.fetch(args[0]));
      otherUser = await message.client.users.fetch(args[0]);
    } catch {}

    otherUser = await message.client.users.fetch(otherUser.id);
    let banner = otherUser.bannerURL()?.toString();
    return banner || "unable to get";
  }

  public get commandData(): CommandData {
    return {
      name: "banner",
      aliases: ["pfb"],
      category: "UTILITY",
      usage: "[<@user> | <user-id>]",
      description: "Get the banner of a user or yours",
    };
  }
}

@plugin()
class Banner extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@otiskujawa/banner",
      version: "0.7.2",
      commands: [banner],
      enabled: false, 
      // this plugin is broken
      // banner and accentColor returns undefined
      // feel free to fix it
    };
  }
}
