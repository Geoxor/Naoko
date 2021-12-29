import Discord from "discord.js";
import { version } from "../../../package.json";
import { LINUX_LOGO, SHAII_LOGO, WINDOWS_LOGO } from "../../constants";
import { msToTime } from "../../logic/logic.shaii";
import { systemInfo } from "../../shaii/Shaii.shaii";
import { defineCommand } from "../../types";

const startTime = Date.now();

export default defineCommand({
  name: "environment",
  category: "UTILITY",
  aliases: ["env"],
  usage: "env",
  description: "Show environment details",

  execute: (message) => {
    // Leave these in here because systeminfo takes 10 hours to fetch data
    // and putting these out there will cause it to be undefined
    const { distro, platform, release } = systemInfo.os;
    const { manufacturer: cpuManufacturer, cores, brand } = systemInfo.cpu;
    const { manufacturer: moboManufacturer, model } = systemInfo.system;
    const gpuModel = systemInfo.graphics.controllers?.[0]?.model;
    const vram = systemInfo.graphics.controllers?.[0]?.vram;
    const totalRam = systemInfo.memLayout.reduce((acc, mem) => acc + mem.size, 0);

    const embed = new Discord.MessageEmbed()
      .setAuthor(`Shaii v${version}`, SHAII_LOGO)
      .setColor("#FF00B6")
      .setThumbnail(platform === "win32" || platform === "win64" ? WINDOWS_LOGO : LINUX_LOGO)
      .addFields(
        { name: "OS", value: `${distro} ${release}` },
        { name: "CPU", value: `x${cores} ${cpuManufacturer} ${brand}` },
        { name: "GPU", value: `${gpuModel} ${vram}MB` },
        { name: "RAM", value: `${~~(totalRam / 1024 / 1024 / 1024)}GB` },
        { name: "Motherboard", value: `${moboManufacturer} ${model}` },
        { name: "Uptime", value: msToTime(Date.now() - startTime) }
      );

    return { embeds: [embed] };
  },
});
