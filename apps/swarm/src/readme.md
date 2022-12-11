# Getting started

- docker

For deploy, make sure you have a docker context `freebox-remote`

CI handles everything but basically this app provides a few command:

- `npx nest start swarm synth` => Creates docker-compose.\*.yml from typescript definitions
- `npx nest start swarm deploy` => Deploy those yaml to remote swarm

### json schema to ts

can be useful to type things
`npx -p json-schema-to-typescript json2ts traefik-v2.json -o traefik-v2.d.ts`
