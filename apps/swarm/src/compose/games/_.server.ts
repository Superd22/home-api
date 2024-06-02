import {
  Compose,
  KeyValue,
  Service,
  ServiceProps,
} from '@homeapi/ctsdk';
import { keyValueFromConfig } from '../../charts/utils/kv-from-config.util';
import type { Entrypoint, TraefikService } from '../traefik/traefik.compose';
import type { WebServiceFactory } from '../../services/web-service/web-service.factory';
import { SwarmApp } from '../../swarm.service';
import { WebProxyNetwork } from '../traefik/webproxy.network';

/**
 * Game server that sits behind the reverse proxy of Traefik
 */
export class GameService extends Service {


  constructor(
    scope: Compose,
    name: string,
    protected readonly config: GameServer,
    protected readonly traefik: TraefikService,
    protected readonly networkFactory: WebServiceFactory
  ) {
    super(scope, name, config.service);

    this.networkFactory 

    this.registerEntryPoints();
    this.addLabels();
    this.networkFactory.ensureWebProxyNetwork(scope)
    this.networkFactory.ensureWebProxyNetwork(this)
  }


  /**
   * Add labels to the deployed service to tell traefik
   * to listen to the entrypoints we created and redirect
   * all trafic to us
   */
  protected addLabels() {
    const serviceName = this.name.toLocaleLowerCase()
    const labels = {
      game: {
        name: this.name,
      },
      traefik: {
        enable: true,
        docker: { network: 'traefik_webproxy' },
      },
    }

    for (const [i, port] of this.config.ports.entries()) {
      const type = port.endsWith('udp') ? 'udp' : 'tcp';
      const portNumber = port.slice(0, port.length - 4)
      labels.traefik[type] = labels.traefik[type] || {};
      labels.traefik[type].services = labels.traefik[type].services || {};
      labels.traefik[type].routers = labels.traefik[type].routers || {};

      /**
       * Basically, we create a router for each port, that just listens
       * to the "entrypoint" of that port and redirect to a lb
       */
      labels.traefik[type].routers[`${serviceName}-router-${i}`] = {
        entrypoints: `${serviceName}_${i}`,
        service: `${serviceName}-lb-${i}`,
      }

      // in UDP we don't want rule, in TCP we have to have one
      if (type === 'tcp') {
        // since we have to have a rule, we just grab all
        labels.traefik[type].routers[`${serviceName}-router-${i}`].rule 
          = "HostSNI(`*`)"

        // labels.traefik[type].routers[`${serviceName}-router-${i}`].tls = {
        //   passthrough: true
        // }
      }

      /**
       * And this LB just redirects to the same port on the actual
       * server
       */
      labels.traefik[type].services[`${serviceName}-lb-${i}`] = {
        loadbalancer: { server: { port: portNumber } },
      }
    }

    this.props.deploy.labels = keyValueFromConfig(
      this.props.deploy.labels as KeyValue[] || [],
      labels
    );
  }

  /**
   * Tell traefik to register new entrypoints on new ports
   * on the reverse proxy
   */
  protected registerEntryPoints() {
    this.traefik.declareEntryPoints(
      this.config.ports.map((port, i) => [
        `${this.name.toLocaleLowerCase()}_${i}`,
        { address: port.startsWith(':') ? [port] : `:${port}` } as Entrypoint,
      ])
    );
  }
}

export interface GameServer {
  /**
   * Actual service to create for this game server
   */
  service: ServiceProps;
  /**
   * Ports to reverse proxy to this container.
   * Make sure they're exposed in your service
   */
  ports: ReverseProxiedPort[];
}

export type ReverseProxiedPort = TCPPort | UDPPort;
export type TCPPort = `${string}/tcp`;
export type UDPPort = `${string}/udp`;
