import { PermissionResolvable } from 'discord.js';
import { CommandCategories, CommandExecuteResponse } from '../types';
import MessageCreatePayload from '../pipeline/messageCreate/MessageCreatePayload';

export type CommandData = {
  name: string;
  description: string;
  /**
   * The syntactic way the command should be used as. Example: "<user> [<reason>]"
   * Argument names MUST be all lowercase kebab-case
   * More examples:
   * - <argument1> <argument2>
   * - [<optional-argument>]
   * - (<either-this-argument> | <or-this-argument>)
   * - <argument> <repeating-argument>...
   * - <@user> [<reason>]
   *
   * Do NOT include the command name at the start
   */
  usage: string;
  category: CommandCategories;
  /**
   * Alternative ways to call this command
   */
  aliases?: string[];
  /**
   * Permissions the user needs to have to run this command
   */
  permissions?: PermissionResolvable[];
  /**
   * This will send 'processing...' if set to true, (useful for commands that take long to complete asynchronous tasks)
   */
  requiresProcessing?: boolean;
}

export default abstract class AbstractCommand {
  /**
   * The handler associated with this command
   */
  public abstract execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> | CommandExecuteResponse;
  
  public abstract get commandData(): CommandData;
}
