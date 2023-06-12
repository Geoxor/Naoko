import { Awaitable } from "discord.js";
import AbstractPipelineElement from "../../AbstractPipelineElement";
import MessageCreatePayload from "../MessageCreatePayload";
import { RESTRICTED_CHANNELS, MOD_ROLE_ID, ADMIN_ROLE_ID } from "../../../constants";
import { singleton } from "@triptyk/tsyringe";

@singleton()
export default class RestrictedChannel extends AbstractPipelineElement {
  execute(payload: MessageCreatePayload): Awaitable<boolean> {
    const message = payload.get('message');

    // Not Geoxor's guild or in a restricted channel -> Continue
    if (!message.member || !RESTRICTED_CHANNELS.includes(message.channel.id)) {
      return true;
    }

    // Check if user is a mod, admin or has admin perms if not, return
    // TODO: Move the restricedChannel const here. It should be the new general id?
    if (
        message.member.roles.cache.some((role) => role.id === MOD_ROLE_ID || role.id === ADMIN_ROLE_ID) ||
        message.member.permissions.has('Administrator')
    ) {
      return true;
    }
    return false;
  }
}
