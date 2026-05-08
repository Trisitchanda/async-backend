# Multi-stage Dockerfile for Backend API
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm i

COPY src ./src

FROM node:18-alpine

# Set non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app /usr/src/app

RUN chown -R appuser:appgroup /usr/src/app

USER appuser

EXPOSE 5000

CMD ["npm", "start"]
