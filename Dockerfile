FROM node:20-alpine
WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN corepack yarn -v
RUN corepack yarn install --immutable

COPY . .

EXPOSE 3000
CMD ["corepack", "yarn", "start:dev"]
