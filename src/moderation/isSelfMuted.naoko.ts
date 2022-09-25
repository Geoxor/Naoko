import { SELF_MUTED_ROLE_ID } from "../constants";
import { IMessage } from "../types";

export function isSelfMuted(message: IMessage) {
  if (message.databaseUser?.is_self_muted || message.member?.roles.cache.has(SELF_MUTED_ROLE_ID)) {
    return true;
  }
  return false;
}
