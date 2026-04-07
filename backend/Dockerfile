FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS production

RUN npm ci --only=production

COPY . .

COPY serviceAccount.json ./

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]

FROM base AS development

RUN npm install

COPY . .

ENV NODE_ENV=development

EXPOSE 5000

CMD ["npm", "run", "dev"]
