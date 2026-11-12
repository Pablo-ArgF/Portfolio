FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

RUN apt-get update \
  && apt-get install --no-install-recommends -y git ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@10.4.1 --activate

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

COPY src ./src

ENV TMPDIR=/work
EXPOSE 3000
CMD ["node", "src/server.js"]
