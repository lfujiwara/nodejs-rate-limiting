FROM node:18-alpine as base

RUN apk update && apk add --no-nocache shadow bash

RUN npm install --no-update-notifier --quiet -g npm && \
    npm config -g set fund false

ARG NEXT_UID=2500
RUN usermod -u ${NEXT_UID} node && groupmod -g ${NEXT_UID} node

ARG UID=1000
ARG GID=1000

ENV APP_DIR="/usr/src/app" \
    APP_GROUP="app" \
    APP_USER="app"

WORKDIR ${APP_DIR}

RUN addgroup -g $GID ${APP_GROUP} && \
    adduser -s /bin/bash -S ${UID} -G ${APP_GROUP} ${APP_USER} && \
    chown $UID:$GID ${APP_DIR}

USER ${APP_USER}:${APP_GROUP}

ARG PORT=3000
ENV PORT=$PORT
EXPOSE ${PORT}

FROM base as dev 

COPY --chown=$UID:$GID package*.json ./
RUN npm ci --quiet
COPY --chown=$UID:$GID . .

ENV NODE_ENV=dev
RUN ["npm", "run", "start:dev"]

FROM dev as prod

RUN npm run build
RUN npm prune --production

ENV NODE_ENV=prod
RUN ["npm", "run", "start:prod"]
