import plugin from "../../decorators/plugin";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import { CommandExecuteResponse } from "../../types";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import AbstractCommand, { CommandData } from "../AbstractCommand";

class svrBanner extends AbstractCommand {
  public async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get("message");

    let banner;
    if (message.guild) {
      if (message && message.guild) banner = message.guild.bannerURL({ size: 2048 }); 
      // banner is 1800 x 1024 and this will display it in full resolution
      // otherwise it will use small resolution
    }
    return banner || "error";
  }

  public get commandData(): CommandData {
    return {
      name: "svrbanner",
      aliases: ["serverbanner", "svrb"],
      category: "UTILITY",
      usage: "",
      description: "Get server banner",
    };
  }
}

@plugin()
class svrbanner extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@otiskujawa/svrbanner",
      version: "1.0.0",
      commands: [svrBanner],
    };
  }
}
