import Discord from "discord.js";
import AbstractCommand from "./AbstractCommand";

type CommandConstructor<T = AbstractCommand> = {
  new (...args: any[]): T;
};

export type DiscordEventHandler<K extends keyof Discord.ClientEvents> = (
  ...args: Discord.ClientEvents[K]
) => Discord.Awaitable<void>;
export type PluginEvents = { [key in keyof Discord.ClientEvents]?: DiscordEventHandler<key> };

export type PluginTimer = {
  /**
   * Time in MS
   */
  interval: number;

  handler: () => void | Promise<void>;
};

export type PluginData = {
  /**
   * The name of the plugin
   *
   * @example
   * "@geoxor/emoji-downloader"
   * "@qexat/bad-word-filter"
   */
  name: `@${string}/${string}`;
  version: `${string}.${string}.${string}`;
  /**
   * Any internal timers the plugin has
   *
   * This is used to automatically unregister any timers when the plugin is disabled in runtime
   */
  timers?: PluginTimer[];
  events?: PluginEvents;
  commands?: CommandConstructor[];
  enabled?: boolean;
};

export default abstract class AbstractPlugin {
  constructor() {
    this.internalInit();
  }

  private internalInit() {
    const pluginData = this.pluginData;

    if (pluginData.timers) {
      for (const timer of pluginData.timers) {
        setInterval(timer.handler.bind(this), timer.interval);
      }
    }
  }

  public abstract get pluginData(): PluginData;
}
