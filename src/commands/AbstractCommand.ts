import { PermissionResolvable } from 'discord.js';
import { CommandCategories, CommandExecuteResponse, IMessage } from '../types';

export type CommandData = {
  /**
   * The name of the command
   */
  name: string;
  /**
   * The description of the command
   */
  description: string;
  /**
   * The syntactic way the command should be used as
   */
  usage: string;
  /**
   * The category type the command belongs to, e.g. "FUN" or "MODERATION"
   */
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
  public abstract execute(message: IMessage): Promise<CommandExecuteResponse> | CommandExecuteResponse;
  
  public abstract get commandData(): CommandData;
}
