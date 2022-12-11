FROM node:18-alpine as base

RUN apk update && apk add --no-cache shadow bash

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
    adduser -s /bin/bash -S --uid ${UID} -G ${APP_GROUP} ${APP_USER} && \
    chown $UID:$GID ${APP_DIR}

USER ${APP_USER}:${APP_GROUP}

EXPOSE 3000

FROM base as dev 

COPY --chown=$UID:$GID package*.json ./
RUN npm ci --quiet
COPY --chown=$UID:$GID . .

ENV NODE_ENV=dev
CMD ["npm", "run", "start:dev"]

FROM dev as prod

RUN npm run build
RUN npm prune --production

ENV NODE_ENV=prod
CMD ["npm", "run", "start:prod"]
