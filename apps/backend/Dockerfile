FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages ./packages
RUN npm install
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/main.js"]
