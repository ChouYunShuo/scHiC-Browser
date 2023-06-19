# Dockerfile

# Stage 1 - Build Vite.js App
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# Stage 2 - Nginx Server
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 82

CMD ["nginx", "-g", "daemon off;"]

