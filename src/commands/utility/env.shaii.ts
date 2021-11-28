import { defineCommand } from "../../types";
import Discord from "discord.js";
import { systemInfo } from "../../shaii/Shaii.shaii";
import { version } from "../../../package.json";
import { msToTime } from "../../logic/logic.shaii";

const startTime = Date.now();

const WINDOWS_LOGO = "https://cdn.discordapp.com/attachments/816028632269979668/878984332025397258/windows.png";
const LINUX_LOGO =
  "https://cdn.discordapp.com/attachments/816028632269979668/878984391936847882/LINUX-LOGO.png";
const SAKURIA_LOGO =
  "https://cdn.discordapp.com/avatars/870496144881492069/0cbefb1d82d00b23cff4bc64ba6406d7.png?size=2048";
const INTEL_EMOJI = "878988243562016798";
const RYZEN_EMOJI = "878988241578123325";
const WINDOWS_EMOJI = "878991085857304666";
const LINUX_EMOJI = "878991302958653480";
const NVIDIA_EMOJI = "878991967500001291";
const RADEON_EMOJI = "878992223809732638";

export default defineCommand({
  name: "env",
  description: "Show environment details",
  requiresProcessing: false,
  execute: (message) => {
    // Shorthand
    const emoji = (id: string) => message.client.emojis.cache.get(id);

    // Leave these in here because systeminfo takes 10 hours to fetch data
    // and putting these out there will cause it to be undefined
    const { distro, platform, release } = systemInfo.os;
    const { manufacturer: cpuManufacturer, cores, brand } = systemInfo.cpu;
    const { manufacturer: moboManufacturer, model } = systemInfo.system;
    const { vendor, model: gpuModel, vram } = systemInfo.graphics.controllers[0];
    const totalRam = systemInfo.memLayout.reduce((acc, mem) => acc + mem.size, 0);

    const CPU_EMOJI = cpuManufacturer === "AMD" ? emoji(RYZEN_EMOJI) : emoji(INTEL_EMOJI);
    const GPU_EMOJI = vendor === "NVIDIA" ? emoji(NVIDIA_EMOJI) : emoji(RADEON_EMOJI);
    const OS_EMOJI = platform === "win32" ? emoji(WINDOWS_EMOJI) : emoji(LINUX_EMOJI);

    const embed = new Discord.MessageEmbed()
      .setAuthor(`Shaii v${version}`, SAKURIA_LOGO)
      .setColor("#FF00B6")
      .setThumbnail(platform === "win32" ? WINDOWS_LOGO : LINUX_LOGO)
      .addFields(
        { name: "OS", value: `${OS_EMOJI} ${distro} ${release}` },
        { name: "CPU", value: `${CPU_EMOJI} x${cores} ${cpuManufacturer} ${brand}` },
        { name: "GPU", value: `${GPU_EMOJI} ${gpuModel} ${vram}MB` },
        { name: "RAM", value: `${~~(totalRam / 1024 / 1024 / 1024)}GB` },
        { name: "Motherboard", value: `${moboManufacturer} ${model}` },
        { name: "Uptime", value: msToTime(Date.now() - startTime) }
      );

    return { embeds: [embed] };
  },
});
