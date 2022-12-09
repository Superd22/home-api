FROM arm64v8/node:lts-alpine

RUN mkdir /opt/server-manager
WORKDIR /opt/server-manager
COPY node_modules /opt/server-manager/node_modules
COPY dist/apps/server-manager /opt/server-manager

ENV NODE_ENV prod
ENV INTERNAL_HOST_IP "$(ip route show default | awk '/default/ {print $3}')"

RUN apk add --update --no-cache openssh

CMD ["node", "main.js"]

EXPOSE 3000