import Discord from "discord.js";
import { DatabaseUser } from "./database.types";
import { COMMAND_CATEGORIES_RAW } from "../constants";

export interface IMessage extends Discord.Message {
  command: string;
  args: string[];
  databaseUser: DatabaseUser;
}

export type CommandExecute = (
  message: IMessage
) => Promise<string | Discord.ReplyMessageOptions | void> | Discord.ReplyMessageOptions | string | void;

export type CommandCategories = typeof COMMAND_CATEGORIES_RAW[number];

export interface CommandDefinition {
  /**
   * The handler associated with this command
   */
  execute: CommandExecute;
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
  permissions?: Discord.PermissionResolvable[];
  /**
   * This will send 'processing...' if set to true, (useful for commands that take long to complete asyncronous tasks)
   */
  requiresProcessing?: boolean;
}

export interface ICommand extends CommandDefinition {
  aliases: string[];
}

export const defineCommand = (definition: CommandDefinition): ICommand => {
  definition.aliases ??= [];
  return definition as ICommand;
};
