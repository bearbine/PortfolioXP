FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ && npm ci

COPY . .
RUN npm run build

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ && npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --chown=node:node server ./server
COPY --chown=node:node assets ./assets

USER node

EXPOSE 4173

CMD ["npm", "run", "docker:start"]
