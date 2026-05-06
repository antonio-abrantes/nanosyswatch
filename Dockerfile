FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY server.js .
COPY middlewares ./middlewares
EXPOSE 3000
CMD ["node", "server.js"]
