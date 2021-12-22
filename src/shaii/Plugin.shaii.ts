import Discord from "discord.js";

// Add more types as the project grows
export const DISCORD_EVENTS: (keyof Discord.ClientEvents)[] = ["messageCreate"];

export type DiscordEventHandler<K extends keyof Discord.ClientEvents> = (
  ...args: Discord.ClientEvents[K]
) => Discord.Awaitable<void>;

export type PluginIdentifier = `@${string}/${string}`;
export type PluginTimers = { [key: string]: NodeJS.Timeout | NodeJS.Timer };
export type PluginEvents = { [key in keyof Discord.ClientEvents]?: DiscordEventHandler<key> };
export enum PluginStates {
  Disabled,
  Enabled,
}

/**
 * Plugins are runtime-loadable type-safe flexable components that have access to all of the bot's events
 * including `timers` which automatically get cleared on hot reloads so you don't have to manage
 * memory
 */
export class Plugin implements IPluginDefinition {
  public name: PluginIdentifier;
  public timers?: PluginTimers;
  public events?: PluginEvents;
  public state: PluginStates;

  constructor(def: IPluginDefinition) {
    (this.timers = def.timers), (this.name = def.name), (this.events = def.events);

    this.state = def.state || def.startupState || PluginStates.Enabled;

    console.log(`  Loaded plugin ${this.name}`);
  }

  public send<K extends keyof Discord.ClientEvents>(event: K, data: Discord.ClientEvents[K]) {
    if (this.state === PluginStates.Disabled) return;

    // TODO: Something is wrong here and it gets passed in in an array im not sure why
    // @ts-ignore
    this.events![event]!(data[0]);
  }

  public toggleState() {
    this.state === PluginStates.Enabled ? (this.state = PluginStates.Disabled) : (this.state = PluginStates.Enabled);
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
   * If the plugin is on, this can change during runtime
   * @default PluginStates.Enabled
   */
  state?: PluginStates;
  /**
   * The default stay this plugin will be in when it gets loaded, false or true
   * @default PluginStates.Enabled
   */
  startupState?: PluginStates;
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
