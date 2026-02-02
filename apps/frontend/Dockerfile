FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages ./packages
RUN npm install
COPY apps/frontend ./apps/frontend
WORKDIR /app/apps/frontend
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
