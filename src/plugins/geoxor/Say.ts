import { singleton } from "@triptyk/tsyringe";
import plugin from "../../decorators/plugin";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from "../AbstractCommand";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";

@singleton()
class SayCommand extends AbstractCommand {
  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const args = payload.get('args');
    const message = payload.get('message');

    if (args.length === 0) {
      return `What do you want to say?`;
    }

    await message.delete();
    return args.join(" ");
  }

  get commandData(): CommandData {
    return {
      name: "say",
      category: "FUN",
      usage: "<sentence>...",
      description: "Say your stupid message",
    }
  }
}

@plugin()
class Say extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: '@geoxor/say',
      version: '1.0.0',
      commands: [SayCommand],
    }
  }
}
