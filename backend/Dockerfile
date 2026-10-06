FROM node:22-slim

RUN apt-get update -y \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN ./node_modules/.bin/prisma generate

COPY src ./src

ENV NODE_ENV=production
EXPOSE 5000
USER node

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node src/server.js"]
