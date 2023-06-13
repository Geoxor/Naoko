import { Awaitable } from "discord.js";
import AbstractPipelinePayload from "./AbstractPipelinePayload";

export default abstract class AbstractPipelineElement {
  abstract execute(payload: AbstractPipelinePayload): Awaitable<boolean>;
}
