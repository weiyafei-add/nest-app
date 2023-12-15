FROM node:18.19.0-alpine3.19

WORKDIR /app

COPY . .

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install

EXPOSE 8080

CMD [ "executable" ]