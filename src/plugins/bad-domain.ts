import { definePlugin } from "../naoko/Plugin";
import badDomains from "./bad-domain/domains.json";
export default definePlugin({
  name: "@geoxor/bad-domain",
  version: "1.0.0",
  events: {
    messageCreate: (message) => {
      for (const badDomain of badDomains)
        if (message.content.toLowerCase().includes(badDomain)) {
          message.delete().catch();
        }
    },
  },
});
