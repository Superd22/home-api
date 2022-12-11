
# Production image, copy all the files and run nest
FROM docker.io/node:lts-alpine as runner
RUN apk add --no-cache dumb-init
ENV NODE_ENV prod
ENV PORT 3000
WORKDIR /usr/src/app
COPY dist/apps/home-api .
RUN chown -R node:node .
USER node
EXPOSE 3000
CMD ["dumb-init", "node", "main.js"]
