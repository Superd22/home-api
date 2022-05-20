# Getting started
- docker

needs a webproxy overlay --attachable network. (@todo probably can be provisioned automatically?)



`docker-compose --context freebox -f traefik/docker-compose.yaml -f diyhue/docker-compose.yaml -f home-assistant/docker-compose.yaml -f mqtt/docker-compose.yaml up -d` to update multiples


# synth
- `npx nest start swarm` currently dumps docker-compose in root



# json schema to ts
`npx -p json-schema-to-typescript json2ts traefik-v2.json -o traefik-v2.d.ts`