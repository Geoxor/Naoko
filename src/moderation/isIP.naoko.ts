import { IPV4_REGEX } from "../constants";
import { IMessage } from "../types";

export function isIP(message: IMessage) {
  return false;
  if (IPV4_REGEX.test(message.content)) {
    return true; // I have your IP address, but I don't want to spam you.
  }
}
