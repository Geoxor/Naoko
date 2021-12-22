import Discord from "discord.js";

export type DiscordEventHandler<K extends keyof Discord.ClientEvents> = (
  ...args: Discord.ClientEvents[K]
) => Discord.Awaitable<void>;

export type PluginIdentifier = `@${string}/${string}`;
export type PluginTimers = { [key: string]: NodeJS.Timeout | NodeJS.Timer };
export type PluginEvents = { [key in keyof Discord.ClientEvents]?: DiscordEventHandler<key> };

export class Plugin implements IPluginDefinition {
  public name: PluginIdentifier;
  public timers?: PluginTimers;
  public events?: PluginEvents;

  constructor(def: IPluginDefinition) {
    (this.timers = def.timers), (this.name = def.name);
    this.events = def.events;

    console.log(`  Loaded plugin ${this.name}`);
  }

  public send<K extends keyof Discord.ClientEvents>(event: K, data: Discord.ClientEvents[K]) {
    // TODO: Something is wrong here and it gets passed in in an array im not sure why
    // @ts-ignore
    this.events![event]!(data[0]);
  }
}

export interface IPluginDefinition {
  /**
   * The name of the plugin
   *
   * @example
   * "@geoxor/emoji-downloader"
   * "@qexat/bad-word-filter"
   */
  name: PluginIdentifier;
  /**
   * Any internal timers the plugin has
   *
   * This is used to automatically unregister any timers when the plugin is disabled in runtime
   */
  timers?: PluginTimers;
  /**
   * Listen to discord events such as "messageCreate" through here
   */
  events?: PluginEvents;
}

/**
 * Defines a plugin for shaii to load
 *
 * Plugins are runtime-loadable type-safe flexable components that have access to all of the bot's events
 * including `timers` which automatically get cleared on hot reloads so you don't have to manage
 * memory
 *
 * @see https://github.com/Geoxor/Shaii#Plugins
 *
 * Let's say you wanna make a plugin that when someone pings shaii she automatically
 * replies to them with a random answer from an array of strings:
 *
 * @example
 * export default definePlugin({
 *   name: "@geoxor/reply-on-mentions",
 *   events: {
 *     messageCreate: (message) => {
 *       if (message.mentions.first() === SHAII) {
 *         message.reply(randomItem(["hello", "you're annoying", "don't talk to me again!"]))
 *       }
 *     },
 *   }
 * });
 *
 */
export const definePlugin = (definition: IPluginDefinition): Plugin => new Plugin(definition);
