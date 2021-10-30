FROM arm64v8/node:lts-alpine3.9

RUN mkdir /opt/home-api
WORKDIR /opt/home-api
COPY node_modules /opt/home-api/node_modules
COPY dist/apps/home-api /opt/home-api

ENV NODE_ENV prod
ENV INTERNAL_HOST_IP "$(ip route show default | awk '/default/ {print $3}')"

RUN apk add --update --no-cache openssh

CMD ["node", "main.js"]

EXPOSE 3000