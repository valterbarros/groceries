FROM node:16.19-bullseye
WORKDIR /app
COPY . .
EXPOSE 1234
RUN npm install -g npm@9.2.0
