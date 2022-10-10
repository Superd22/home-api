import { BindVolume, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { Config } from '../config.encrypted';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';
import { reverseProxyToWeb } from './traefik/reverse-proxy-to-web';
import { WebProxyNetwork } from './traefik/webproxy.network';

@Injectable()
/**
 * Plex server + UnicornLoadBalancer to allow multiple nodes to handle transcoding
 */
export class JellyFin extends Compose {
  protected readonly timezone = 'Europe/Paris';

  protected readonly volumes = {
    'jellyfin-config': new Volume(
      this,
      'jellyfin-config',
    ),
  } as const;



  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
    protected readonly webproxyNetwork: WebProxyNetwork,
    protected readonly config: Config,
  ) {
    super(app, JellyFin.name, { version: '3.6', name: null });

    webproxyNetwork.bind(this)

    const jellyfin = this.web.webService(this, 'jellyfin', {
      web: {
        match: 'Host("jellyfin.davidfain.com")',
        allowHttp: true,
        port: 8096,
      },
      serviceProps: {
        image: 'lscr.io/linuxserver/jellyfin:latest',
        deploy: {
          replicas: 1,
        },
        networks: {
          [this.webproxyNetwork.id(this)]: {},
        },
        volumes: [
          `/mnt/raid/0.SHARED/0.Media:/data`,
          `${this.volumes['jellyfin-config'].id(this)}:/config`,
        ],
        environment: [
          ...keyValueFromConfig({
            PUID: 1000,
            PGID: 1000,
            TZ: this.timezone,
            JELLYFIN_PublishedServerUrl: "jellyfin.davidfain.com"
          }),
        ],
      }
    })

    new NodeSelector(jellyfin, AvailableNodes.Galactica);
  }
}