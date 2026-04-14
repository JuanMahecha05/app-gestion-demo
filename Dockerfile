FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
COPY backend/prisma ./prisma

RUN npm ci

COPY backend .

RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "railway:start"]
