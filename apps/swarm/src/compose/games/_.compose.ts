import { Compose } from "@homeapi/ctsdk";
import { SwarmApp } from "../../swarm.service";
import { TraefikService, Entrypoint } from "../traefik/traefik.compose";

/**
 * deprecated, please use GameService instead
 */
export abstract class GameServerCompose extends Compose {


  constructor(
    protected readonly app: SwarmApp,
    name: string,
    protected readonly traefik: TraefikService,
    protected readonly config: { ports?: string[] },
  ) {
    super(app, name, { version: '3.6', name: null })

    if (config.ports.length)
      this.traefik.declareEntryPoints(
        config.ports
          .map((port, i) =>
            [
              `${name.toLocaleLowerCase()}_${i}`,
              { address: port.startsWith(':') ? [port] : `:${port}` } as Entrypoint
            ]
          )
      )
  }

}