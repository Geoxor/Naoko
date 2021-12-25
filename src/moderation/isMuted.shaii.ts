import { MUTED_ROLE_ID } from "../constants";
import { IMessage } from "../types";

export function isMuted(message: IMessage) {
  if (message.databaseUser.is_muted || message.member?.roles.cache.has(MUTED_ROLE_ID)) {
    return true;
  }
  return false;
}
