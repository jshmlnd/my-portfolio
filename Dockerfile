FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source
COPY server.js ./
COPY src/pages/game/wordbank.js ./src/pages/game/wordbank.js

# Copy built frontend
COPY dist ./dist

EXPOSE 3001

CMD ["node", "server.js"]
