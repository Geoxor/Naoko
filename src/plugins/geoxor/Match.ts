import { User } from "discord.js";
import plugin from "../../decorators/plugin";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from "../AbstractCommand";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import { singleton } from "@triptyk/tsyringe";

@singleton()
class MatchCommand extends AbstractCommand {
  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const message = payload.get("message");

    if (!message.mentions.members?.size) return "Tag the person you want to match with!";

    let matcher, matchee: User;
    // Check if they mentions 2 users or not
    if (message.mentions.users?.size >= 2) {
      matcher = message.mentions.users.at(0)!;
      matchee = message.mentions.users.at(1)!;
    } else {
      matcher = message.author;
      matchee = message.mentions.users.first()!;
    }

    const matcherValue = parseFloat(matcher.id);
    const matcheeValue = parseFloat(matchee.id as string);
    const matchValue = (matcherValue + matcheeValue) % 22;
    const matchCalculation = ((22 - matchValue) / 22) * 100;

    const shipName = this.getShipName(matcher.username, matchee.username);

    const perfectMatchString = `You perfectly match ${~~matchCalculation}% ${shipName}`;
    const matchString = `You match ${~~matchCalculation}% ${shipName}`;
    return matchCalculation == 100 ? perfectMatchString : matchString;
  }

  getShipName(matcher: string, matchee: string) {
    return matcher.substring(0, matcher.length >> 1) + matchee.substring(matchee.length >> 1);
  }

  get commandData(): CommandData {
    return {
      name: "match",
      category: "FUN",
      usage: "<@user> [<@user>]",
      description: "See how much you and another user match!",
    };
  }
}

@plugin()
class Match extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@geoxor/match",
      version: "1.0.0",
      commands: [MatchCommand],
    };
  }
}
