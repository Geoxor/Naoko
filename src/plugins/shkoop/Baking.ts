import AbstractCommand, { CommandData } from "../../commands/AbstractCommand";
import plugin from "../../decorators/plugin";
import { randomChoice } from "../../logic/logic";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import { IMessage, CommandExecuteResponse } from "../../types";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";

class Bake extends AbstractCommand {
  private static CAKES = [
    "https://cdn.discordapp.com/attachments/634839969822801998/964236192646320148/cake_1.jpg",
    "https://cdn.discordapp.com/attachments/634839969822801998/964236192843464754/cake_2.jpg",
    "https://cdn.discordapp.com/attachments/634839969822801998/964236193032183898/pink-cake.jpg",
    "https://cdn.discordapp.com/attachments/634839969822801998/964236193258692758/lie.jpg",
    "https://cdn.discordapp.com/attachments/634839969822801998/964236193455820851/cake.jpg",
  ];

  private static PIES = [
    "https://cdn.discordapp.com/attachments/634839969822801998/964236236317417512/pie-1.jpg",
    "https://cdn.discordapp.com/attachments/634839969822801998/964236236631998495/pies.jpg",
    "https://cdn.discordapp.com/attachments/634839969822801998/964236236908798033/coco.jpg",
    "https://cdn.discordapp.com/attachments/634839969822801998/964236237252743198/apple.jpg",
    "https://cdn.discordapp.com/attachments/634839969822801998/964236237554745425/beryy.jpeg",
  ];

  public execute(payload: MessageCreatePayload): CommandExecuteResponse {
    const arg = payload.get('args')[0];
    if (!arg) {
      return `What do you want to bake?`;
    }

    // the baked goods + easter eggs
    switch (arg) {
      case "cake":
        return `${randomChoice(Bake.CAKES)}`;
      case "pie":
        return `${randomChoice(Bake.PIES)}`;
      case "OFC":
        return "https://cdn.discordapp.com/attachments/963948583806205962/963971146074705920/shit.png";
    }
  }

  public get commandData(): CommandData {
    return {
      name: "bake",
      category: "FUN",
      usage: "bake <what-to-bake>",
      description: "Bake something",
    };
  }
}

@plugin()
class Baking extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@shkoop/baking",
      version: "1.0.0",
      commands: [Bake],
    };
  }
}

