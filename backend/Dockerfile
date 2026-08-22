FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY .puppeteerrc.cjs ./

RUN npm ci

COPY . .

EXPOSE 5050

CMD ["node", "server.js"]