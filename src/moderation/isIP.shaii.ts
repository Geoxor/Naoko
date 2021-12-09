import { IPV4_REGEX } from "../constants";
import { IMessage } from "../types";

export function isIP(message: IMessage) {
  if (IPV4_REGEX.test(message.content)) {
    return true;
  }

  return false;
}
