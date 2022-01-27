# 🌸 Shaii General Purpose Bot
<img align="left" src="https://media.discordapp.net/attachments/550913067517607946/634231448928387072/OC_Shaii_CHIBICHARM2.png?width=200&height=236">

## ⚡ Plugins
Plugins are runtime-loadable type-safe flexible components that have access to all of the bot's events
including `timers` which automatically get cleared on hot reloads so you don't have to manage
memory

### Example

Let's say you wanna make a plugin that when someone pings shaii she automatically
replies to them with a random answer from an array of strings:

```ts
// plugins/reply-on-mentions.ts

export default definePlugin({
  name: "@geoxor/reply-on-mentions",
  events: {
    messageCreate: message => {
      if (message.mentions.first() === SHAII) {
        message.reply(randomItem(["hello", "you're annoying", "don't talk to me again!"]));
      }
    },
  },
});
```

## 🗃 Installation

1. Get a discord bot token
2. Install bloatware

```
sudo apt install -y build-essential g++-10 libxi-dev libxext-dev libpixman-1-dev libcairo2-dev libpango1.0-dev libjpeg8-dev libgif-dev libjpeg-dev librsvg2-dev mesa-common-dev
```
3. Use node.js 16.6.0 `nvm install 16.6.0 && nvm use 16.6.0`
4. Configure your `config.shaii.json` in `src`
5. `CXX=10 npm ci` to install dependencies
6. `npm run dev` to run the bot
