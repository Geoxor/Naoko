# 🌸 Naoko General Purpose Bot
## 🗃 Installation

1. Make a new bot through the developer portal so that you have a token for use in `config.naoko.json`
2. Fork, clone repo & cd into the folder Naoko

Next, depending on your platform:

### Linux

1. Install dependencies

```
sudo apt install -y build-essential g++-10 libxi-dev libxext-dev libpixman-1-dev libcairo2-dev libpango1.0-dev libjpeg8-dev libgif-dev libjpeg-dev librsvg2-dev mesa-common-dev
```

2. _TODO: set up mongo on linux_
3. Use node.js 16.6.0 `nvm install 16.6.0 && nvm use 16.6.0`
4. `npm i` to install dependencies

### Windows

1. Install Node version 16.x.x
2. Install MongoDB Community https://www.mongodb.com/try/download/community & follow default installation
3. With administrator privileges, do `npm i` in the repository folder

Once all these are set up:

1. Make `config.naoko.json` in `src` following `example.config.naoko.json`
   Set path to a music folder (make an empty one in the repo folder if you don't care)
   Set the token
   Set the chat log ID
   Set url to mongodb (mongodb://127.0.0.1:27017 if hosting locally)
2. In `constants/index.ts` replace guild & channel IDs with those of your test guild
3. `npm run dev`

### Docker

If you have docker installed you can simple build the image and run the install from inside the docker container
```shell
docker compose run --rm -it node-cli yarn install
```

The compose file also includes the mongo server needed to run naoko
