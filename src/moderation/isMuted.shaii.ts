import { IMessage } from "../types";

export function isMuted(message: IMessage) {
  if (message.databaseUser.is_muted || message.member?.roles.cache.has("737011597217628231")) {
    return true;
  }
  return false;
}
