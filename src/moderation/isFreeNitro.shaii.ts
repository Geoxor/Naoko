import { IMessage } from "../types";

export function isFreeNitro(message: IMessage) {
  if (message.content.includes("free") && message.content.includes("nitro") && message.content.includes("http")) {
    return true;
  }

  return false;
}
