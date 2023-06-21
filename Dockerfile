FROM node:18

USER root

RUN apt update \
 && apt install -y build-essential g++-10 libxi-dev libxext-dev libpixman-1-dev libcairo2-dev libpango1.0-dev libjpeg62-turbo-dev libgif-dev libjpeg-dev librsvg2-dev mesa-common-dev \
 && ln -s /usr/bin/python3 /usr/bin/python

USER node
WORKDIR /app
