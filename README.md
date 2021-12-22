# 🌸 Shaii General Purpose Bot
<img align="left" src="https://media.discordapp.net/attachments/550913067517607946/634231448928387072/OC_Shaii_CHIBICHARM2.png?width=216&height=256">

## ⚡ Plugins
Plugins are runtime-loadable type-safe flexable components that have access to all of the bot's events
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
    messageCreate: (message) => {
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
sudo apt install -y build-essential libxi-dev libxext-dev libpixman-1-dev libcairo2-dev libpango1.0-dev libjpeg8-dev libgif-dev
```

3. Configure your `config.shaii.json` in `src`
4. `npm i` to install dependencies
5. `npm run dev` to run the bot
