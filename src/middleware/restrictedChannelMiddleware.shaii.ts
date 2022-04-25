import { ADMIN_ROLE_ID, GEOXOR_GUILD_ID, GEOXOR_ID, MOD_ROLE_ID, restrictedChannels, SVRGE_ID } from "../constants";
import logger from "../shaii/Logger.shaii";
import { IMessage } from "../types";

/**
 * A Middleware that checks if the message is in a restricted channel and if it is, checks if the user has the required permissions to utilize bot commands in that channel.
 * @param message IMessage to be checked
 * @param next The next function to be called
 * @return Returns void if checks are not met, otherwise returns the next function with the message
 */
export default function (message: IMessage, next: (message: IMessage) => any): void {
  try {
    // Not Geoxor's guild or restricted channel, continue to next function
    if (message.guild?.id !== GEOXOR_GUILD_ID || !restrictedChannels.includes(message.channel.id)) return next(message);
    // Geoxor's guild and restricted channel, check if user is a mod or admin, svrge or geo, if not, return
    if (
      !(
        message.member?.roles.cache.some((role) => role.id === MOD_ROLE_ID || role.id === ADMIN_ROLE_ID) ||
        message.author.id === GEOXOR_ID ||
        message.author.id === SVRGE_ID
      )
    )
      return;
    return next(message);
  } catch (error) {
    logger.error(error as string);
    return;
  }
}
