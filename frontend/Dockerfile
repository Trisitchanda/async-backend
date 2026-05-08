# Local dev Dockerfile for Frontend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Run the Vite dev server with host binding so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
