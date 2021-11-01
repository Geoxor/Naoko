import Discord from "discord.js";

export function isFreeNitro (message: Discord.Message) {
  if (message.content.includes("free") 
    && message.content.includes("nitro") 
    && message.content.includes("http")){
      return true;
  }

  return false;
}