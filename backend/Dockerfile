FROM node:18-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]