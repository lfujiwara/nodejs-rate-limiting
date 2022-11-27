# Sample NestJS project bootstrap

In this article, we’ll setup a NestJS project with my preferred configurations, feel free to customize to your needs and liking. For reference, I’ll be using Node v18 and npm v8.

## 1: Install the NestJS CLI and create a new project

```bash
$ npm i -g @nestjs/cli
$ nest new nestjs-template
```

## 2: Development environment & tools

Let’s start by building a decent development environment that makes effortless to clone and start coding.

### 2.1: Formatting & linting rules

Setup all required rules that you find reasonable on linting/formatting rules, it’s better than writing it somewhere and hoping for everyone opening and reviewing PRs to read and remember it every time.

For example, I’ll have `camelCase` for variables and `PascalCase` for classes, using `@typescript-eslint/naming-convention` rule for ESLint (under `.eslintrc.js`, and `.rules` path:

```json
{
  '@typescript-eslint/naming-convention': [
		'error',
    {
      selector: 'variable',
      format: ['strictCamelCase'],
    },
    {
      selector: ['class', 'interface', 'typeAlias', 'typeParameter', 'enum'],
      format: ['StrictPascalCase'],
    }
}
```

### 2.2: Editor config

On the project root, place a file named `.editorconfig`, this makes sure that (almost) every code editor/IDE know a little bit more about our project.

```
root = true

[*]
end_of_line = lf
charset = utf-8

[*.{js,ts,json}]
tab_width = 2
indent_size = 2
indent_style = space
insert_final_newline = true

```

### 2.2: VSCode config

Place a `.vscode/settings.json` file like this under the project root to make VSCode users life easier.

```json
{
  "files.eol": "\n",
  "prettier.endOfLine": "lf",
  "material-icon-theme.activeIconPack": "nest",
  "[typescript]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2,
    "files.insertFinalNewline": true,
    "files.trimFinalNewlines": true
  },
  "[javascript]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2,
    "files.insertFinalNewline": true,
    "files.trimFinalNewlines": true
  },
  "[jsonc]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2,
    "files.insertFinalNewline": true,
    "files.trimFinalNewlines": true
  }
}
```

This will apply settings like the ones defined in `.editorconfig` and also format files upon saving.

### 2.3: Git hooks

Git hooks are good to always check for mistakes and possibly fix it before committing or pushing it. We want our code to be linted, formatted and tested before sending it to the server. For the moment, we’ll use Husky, a npm package that helps us define and run git hooks.

1. Install Husky with `npx husky-init && npm install`
    - This will add Husky to our development dependencies, create the necessary files (`.husky` folder and a suggested `.pre-commit` setup) and add the Husky setup to the `npm prepare` script, which will make npm setup Husky when `npm install` is called (without arguments).
2.  Setup `pre-commit` script
    - Husky already sets up the `pre-commit` hook (if not, use `npx husky add .husky/pre-commit" npm run format"`), edit it to run formatting and linting scripts
    
    ```bash
    #!/usr/bin/env sh
    . "$(dirname -- "$0")/_/husky.sh"
    
    npm run format
    npm run lint
    ```
    
3. Setup `pre-push` script
- You can copy the `.husky/pre-commit` file into `.husky/pre-push` and edit or…
- Use `npx husky add .husky/pre-push "npm run test:cov"`, then `npx husky add .husky/pre-push "npm run test:e2e"`

### 2.4: Containers

Containers are useful for a more controlled development environment, may not be the best convenient way to develop, but is certainly useful, and our setup could also be used for production.

Let’s start by setting up a `Dockerfile`

```docker
# Base image (Alpine Linux, a little lighter than debian based images)
FROM node:18-alpine as base

# Update apk and add shadow (usermod/groupmod) and bash
RUN apk update && apk add --no-nocache shadow bash

# Update npm and supress funding messages
RUN npm install --no-update-notifier --quiet -g npm && \
    npm config -g set fund false

# Change the UID of the default node user (UID 1000)
ARG NEXT_UID=2500
RUN usermod -u ${NEXT_UID} node && groupmod -g ${NEXT_UID} node

# Set the desired UID of the user that will run the app
ARG UID=1000
ARG GID=1000

# Set directories and user/group names
ENV APP_DIR="/usr/src/app" \
    APP_GROUP="app" \
    APP_USER="app"

WORKDIR ${APP_DIR}

# Create group, user and set permissions
RUN addgroup -g $GID ${APP_GROUP} && \
    adduser -s /bin/bash -S ${UID} -G ${APP_GROUP} ${APP_USER} && \
    chown $UID:$GID ${APP_DIR}

# Tell docker which user should be used
USER ${APP_USER}:${APP_GROUP}

# Set port to be exposed
ARG PORT=3000
ENV PORT=$PORT
EXPOSE ${PORT}

# Development stage
FROM base as dev

# Copy dependencies info and install from frozen lockfile (ci instead of install)
COPY --chown=$UID:$GID package*.json ./
RUN npm ci --quiet
# Copy the rest of the files, this way the dependencies layer image can be cached
COPY --chown=$UID:$GID . .

ENV NODE_ENV=dev
RUN ["npm", "run", "start:dev"]

FROM dev as prod

# Build TS and remove dev dependencies
RUN npm run build
RUN npm prune --production

ENV NODE_ENV=prod
RUN ["npm", "run", "start:prod"]
```

### 2.5: Commit changes

Simply

```docker
git add . && git commit -m "bootstrap project"
```

This will run linters and formatters and if everything is ok, will commit to the local git, as soon as you push it (given that you added a remote), it will run tests and check if everything is okay too.
