import { IMessage } from "../types";

export function isMuted (message: IMessage) {
  if (message.databaseUser.is_muted || message.member?.roles.cache.has("737011597217628231")){
    message.delete();
    return true;
  }
  return false;
}