FROM node:8.16.2

WORKDIR /usr/app
EXPOSE 6001

COPY package.json .
RUN npm install --quiet
COPY . .
