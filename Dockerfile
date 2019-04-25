FROM alpine:latest

RUN apk add --update --no-cache nodejs \
        nodejs-npm \
        binutils-gold \
        curl \
        g++ \
        gcc \
        gnupg \
        libgcc \
        linux-headers \
        make \
        python

COPY package*.json ./

RUN npm set progress=false && \
    npm config set depth 0 && \
    npm install && \
    npm cache clean --force && \
    npm uninstall -g npm