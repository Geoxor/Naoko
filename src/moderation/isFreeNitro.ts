import { IMessage } from "../types";

export function isFreeNitro(message: IMessage) {
  if (message.content.toLowerCase().includes("nitro") && message.content.toLowerCase().includes("http")) {
    return true;
  }

  return false;
}
