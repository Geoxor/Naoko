import { Message } from "discord.js";
import AbstractPipelinePayload from "../AbstractPipelinePayload";
import { DatabaseUser } from "../../types";
import AbstractCommand from "../../plugins/AbstractCommand";

type Payload = {
  message: Message,
  dbUser?: DatabaseUser,
  commandName?: string,
  args?: string[],
  comand?: AbstractCommand,
}

export default class MessageCreatePayload extends AbstractPipelinePayload<Payload> {}
