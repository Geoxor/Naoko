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
    messageCreate: (message) => {
      if (message.mentions.first() === SHAII) {
        message.reply(randomItem(["hello", "you're annoying", "don't talk to me again!"]));
      }
    },
  },
});
```

## 🗃 Installation

1. Make a new bot through the developer portal so that you have a token for use in `config.shaii.json`
2. Fork, clone repo & cd into the folder Shaii

Next, depending on your platform:
### Linux

1. Install dependencies

```
sudo apt install -y build-essential g++-10 libxi-dev libxext-dev libpixman-1-dev libcairo2-dev libpango1.0-dev libjpeg8-dev libgif-dev libjpeg-dev librsvg2-dev mesa-common-dev
```
2. *TODO: set up mongo on linux*
3. Use node.js 16.6.0 `nvm install 16.6.0 && nvm use 16.6.0`
4. `CXX=10 npm ci` to install dependencies

### Windows

1. Install Node versoin 16.x.x
2. Install MongoDB Community https://www.mongodb.com/try/download/community & follow default installation
3. npm i

Once all these are set up:

1. Make `config.shaii.json` in `src` following `example.config.shaii.json` 
  Set path to a music folder (make an empty one in the repo folder if you don't care)
  Set the token
  Set the chat log ID
  Set url to mongodb (mongodb://127.0.0.1:27017 if hosting locally)
2. In `constants/index.ts` replace guild & channel IDs with those of your test guild
3. `npm run dev`

GG