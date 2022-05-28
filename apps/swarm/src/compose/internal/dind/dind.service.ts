import { Compose, Service, ServiceProps, Volume } from "@homeapi/ctsdk";
import { keyValueFromConfig } from "apps/swarm/src/charts/utils/kv-from-config.util";

/**
 * Hack because [https://github.com/moby/moby/issues/41371](Security_opp) is not supported
 * by docker services :facepalm:
 * 
 * Instead we create a service that has access to the docker socket from the host and launches the really container
 * we want manually
 */
export class LaunchThroughComposeService extends Service {
  
  constructor(
    scope: Compose,
    name: string,
    internalServiceProps: ServiceProps,
    externalServiceProps: Omit<ServiceProps, 'image' | 'command' | 'volumes'> = {},
    onCompose: (compose: Compose) => void = () => {}
    ) {
    const tempCompose = new Compose(null, `${name}`, { version: "3.6" })
    onCompose(tempCompose)
    const tmpService = new Service(tempCompose, `${name}`, { ...internalServiceProps })

    super(scope, `${name}_launcher`, {
      ...externalServiceProps,
      image: 'danieletorelli/compose',
      entrypoint: 'sh',
      command: [
        "-c",
        // @todo do this better omg
        `echo "${tempCompose.toYAML().replace(/"/g, "\\\"")}" > docker-compose.yml && cat docker-compose.yml && docker-compose up`,
      ],
      volumes: [
        '/var/run/docker.sock:/var/run/docker.sock'
      ],
    })
  }

}