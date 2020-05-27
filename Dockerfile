FROM arm64v8/node:lts-alpine3.9

RUN mkdir /opt/home-api
WORKDIR /opt/home-api
COPY . /opt/home-api

ENV NODE_ENV prod
ENV INTERNAL_HOST_IP "$(ip route show default | awk '/default/ {print $3}')"

RUN apk add --update --no-cache openssh

RUN npm rebuild

CMD ["node", "dist/apps/home-api/main.js"]

EXPOSE 3000