import { EmbedBuilder } from "discord.js";
import { NAOKO_LOGO, WINDOWS_LOGO, LINUX_LOGO } from "../../constants";
import Naoko from "../../naoko/Naoko";
import { CommandExecuteResponse } from "../../types";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import si from "systeminformation";
import plugin from "../../decorators/plugin";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import TimeFormattingService from "../../service/TimeFormattingService";
import AbstractCommand, { CommandData } from "../AbstractCommand";
import { singleton } from "@triptyk/tsyringe";

@singleton()
class Ping extends AbstractCommand {
  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get("message");
    const timestampMessage = await message.channel.send("🏓 Getting ping...");
    const latency = timestampMessage.createdTimestamp - message.createdTimestamp;
    await timestampMessage.edit(`🏓 Pong! Latency is ${latency}ms. API Latency is ${~~message.client.ws.ping}ms`);
  }

  get commandData(): CommandData {
    return {
      name: "ping",
      category: "UTILITY",
      usage: "",
      description: "Get discord api latency",
    };
  }
}

@singleton()
class Uptime extends AbstractCommand {
  constructor(private timeFormatter: TimeFormattingService) {
    super();
  }

  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const client = payload.get("message").client;
    return this.timeFormatter.msToFullTime(client.uptime);
  }

  get commandData(): CommandData {
    return {
      name: "uptime",
      category: "UTILITY",
      usage: "",
      description: "Returns the bots uptime",
    };
  }
}

@singleton()
class Env extends AbstractCommand {
  private systemInfo: si.Systeminformation.StaticData | null = null;

  constructor(private timeFormatter: TimeFormattingService) {
    super();
  }

  private async getSystemInfo(): Promise<si.Systeminformation.StaticData> {
    if (!this.systemInfo) {
      this.systemInfo = await si.getStaticData();
    }
    return this.systemInfo;
  }

  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const client = payload.get("message").client;
    const systemInfo = await this.getSystemInfo();

    // Leave these in here because systeminfo takes 10 hours to fetch data
    // and putting these out there will cause it to be undefined
    const { distro, platform, release } = systemInfo.os;
    const { manufacturer: cpuManufacturer, cores, brand } = systemInfo.cpu;
    const { manufacturer: moboManufacturer, model } = systemInfo.system;
    const gpuModel = systemInfo.graphics.controllers?.[0]?.model;
    const vram = systemInfo.graphics.controllers?.[0]?.vram;
    const totalRam = systemInfo.memLayout.reduce((acc, mem) => acc + mem.size, 0);

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Naoko v${Naoko.version}`, iconURL: NAOKO_LOGO })
      .setTitle("Environment")
      .setColor("#FF00B6")
      .setThumbnail(platform === "win32" || platform === "win64" ? WINDOWS_LOGO : LINUX_LOGO)
      .addFields(
        { name: "OS", value: `${distro} ${release}` },
        { name: "CPU", value: `x${cores} ${cpuManufacturer} ${brand}` },
        { name: "RAM", value: `${~~(totalRam / 1024 / 1024 / 1024)}GB` },
        { name: "Motherboard", value: `${moboManufacturer} ${model}` },
        { name: "Uptime", value: this.timeFormatter.msToFullTime(client.uptime || 0) },
      );
    if (gpuModel && vram) {
      embed.addFields({ name: "GPU", value: `${gpuModel} ${vram}MB` });
    }

    return { embeds: [embed] };
  }

  get commandData(): CommandData {
    return {
      name: "env",
      category: "UTILITY",
      usage: "",
      description: "Show environment details",
    };
  }
}

@plugin()
class Environment extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@geoxor/environment",
      version: "1.0.0",
      commands: [Uptime, Env, Ping],
    };
  }
}
