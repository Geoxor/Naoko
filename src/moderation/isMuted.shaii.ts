import { IMessage } from "../types";
import { MUTED_ROLE_ID } from "../constants";

export function isMuted(message: IMessage) {
  if (message.databaseUser.is_muted || message.member?.roles.cache.has(MUTED_ROLE_ID)) {
    return true;
  }
  return false;
}
