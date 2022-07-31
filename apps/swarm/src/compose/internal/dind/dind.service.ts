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
    externalServiceProps: Omit<ServiceProps, 'image' | 'command'> = {},
    onCompose: (compose: Compose) => void = () => {}
    ) {
    const tempCompose = new Compose(null, `${name}`, { version: "3.6" })
    onCompose(tempCompose)
    const tmpService = new Service(tempCompose, `${name}`, { ...internalServiceProps })

    super(scope, `${name}_launcher`, {
      ...externalServiceProps,
      image: 'codefresh/compose',
      container_name: `launcher-dind-${name}`,
      entrypoint: 'sh',
      command: [
        "-c",
        // @todo do this better omg
        `mkdir ~/compose/ -p && cd ~/compose/ && echo "${tempCompose.toYAML().replace(/`/g, '\\`').replace(/"/g, "\\\"")}" > docker-compose.yml && cat docker-compose.yml && docker-compose up > /dev/null`,
      ],
      volumes: [
        ...(externalServiceProps?.volumes as string[]) || [],
        '/var/run/docker.sock:/var/run/docker.sock'
      ],
    })
  }

}