import { singleton } from "@triptyk/tsyringe";
import plugin from "../../decorators/plugin";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../types";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import { Message } from "discord.js";
import AbstractCommand, { CommandData } from "../AbstractCommand";
import axios from "axios";

const token = ""; //put youtube token here
// move it to config later

@singleton()
class ytlink extends AbstractCommand {

  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    // if (payload.get("message").member?.id !== "536663229062184963") return; leftover after breaking stuff
    const arg = payload.get("args").join("%20");
    if (!arg) {
      return "Giv video name";
    }
    // idk if it secures something but still better than nothing
    if (arg.includes("&") || arg.includes("'") || arg.includes('"')) {return "remove special characters"}

    // ask for video metadata
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${arg}&type=video&key=${token}`);

    // send link that embeds using video id
    return `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`;
  }

  get commandData(): CommandData {
    return {
      name: "ytlink",
      aliases: ["ytl", "yt"],
      category: "UTILITY",
      usage: "<search_string>",
      description: "Tries to find youtube link by using title\n Requires token to be enabled",
      requiresProcessing: true,
    };
  }
}

@plugin()
class youtubelink extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@otiskujawa/ytlink",
      version: "1.0.0",
      commands: [ytlink],
      enabled: (token ? true : false)
    };
  }
}