import { injectAll, singleton } from '@triptyk/tsyringe';
import AbstractPlugin from './AbstractPlugin';
import { Client } from 'discord.js';

@singleton()
export class PluginManager {
  constructor(
    @injectAll('naokoPlugin') private plugins: AbstractPlugin[],
  ) {}

  getAll(): AbstractPlugin[] {
    return this.plugins;
  }

  registerEventListener(client: Client): void {
    // TODO: Create a Proxy for logging events
    for (const plugin of this.plugins) {
      if (!plugin.pluginData.events || plugin.pluginData.enabled === false) {
        continue;
      }

      for (const [eventName, handler] of Object.entries(plugin.pluginData.events)) {
        client.on(eventName, handler.bind(plugin));
      }
    }
  }
}
