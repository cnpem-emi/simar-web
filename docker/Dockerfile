FROM node:17.4.0-stretch-slim as builder

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json babel.config.js vue.config.js .env tsconfig.json ./

RUN npm install

COPY public public
COPY src src
COPY --chown=node:node src src
COPY --chown=node:node public public

USER node
ENV NODE_ENV production
RUN npm run build

FROM nginx:1.21.5-alpine

COPY --from=builder /home/node/app/dist /usr/share/nginx/html/simar
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
