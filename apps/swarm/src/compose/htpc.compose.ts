import { BindVolume, Compose, Network, Port, Service, SwarmDevice, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { Config } from '../config.encrypted';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';
import { LaunchThroughComposeService } from './internal/dind/dind.service';
import { reverseProxyToWeb } from './traefik/reverse-proxy-to-web';
import { WebProxyNetwork } from './traefik/webproxy.network';

@Injectable()
/**
 * HTPC Setup comprising of everything required
 * to organize and stream librairy of movies/TV-SHOWS
 */
export class HTPC extends Compose {
  protected readonly timezone = 'Europe/Paris';

  protected readonly volumes = {
    'jellyfin-config': new Volume(
      this,
      'jellyfin-config',
    ),
    'sonarr-config': new Volume(
      this,
      'sonarr-config'
    ),
    'bazarr-config': new Volume(
      this,
      'bazarr-config'
    ),
    'prowlarr-config': new Volume(
      this,
      'prowlarr-config'
    )
  } as const;



  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
    protected readonly webproxyNetwork: WebProxyNetwork,
    protected readonly config: Config,
  ) {
    super(app, HTPC.name, { version: '3.6', name: null });

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
        devices: [
          new SwarmDevice('/dev/dri/renderD128'),
          new SwarmDevice('/dev/dri/card0')
        ],
        environment: [
          ...keyValueFromConfig({
            PUID: 1000,
            PGID: 1000,
            TZ: this.timezone,
            JELLYFIN_PublishedServerUrl: "jellyfin.davidfain.com"
          }),
        ]
      }
    })


    const sonarr = this.web.webService(this, 'sonarr', {
      web: {
        match: 'Host("sonarr.davidfain.com")',
        port: 8989,
      },
      serviceProps: {
        image: 'lscr.io/linuxserver/sonarr:latest',
        deploy: {
          replicas: 1,
        },
        networks: {
          [this.webproxyNetwork.id(this)]: {},
        },
        volumes: [
          `/mnt/raid/0.SHARED/:/data`,
          `${this.volumes['sonarr-config'].id(this)}:/config`,
        ],
        environment: [
          ...keyValueFromConfig({
            PUID: 1000,
            PGID: 1000,
            TZ: this.timezone,
          }),
        ],
      }
    })

    const prowlarr = this.web.webService(this, 'prowlarr', {
      web: {
        match: 'Host("prowlarr.davidfain.com")',
        port: 9696,
      },
      serviceProps: {
        image: 'lscr.io/linuxserver/prowlarr:develop',
        deploy: {
          replicas: 1,
        },
        dns: '8.8.8.8',
        networks: {
          [this.webproxyNetwork.id(this)]: {},
        },
        volumes: [
          `${this.volumes['prowlarr-config'].id(this)}:/config`,
        ],
        environment: [
          ...keyValueFromConfig({
            PUID: 1000,
            PGID: 1000,
            TZ: this.timezone,
          }),
        ],
      }
    })
    const bazarr = this.web.webService(this, 'bazarr', {
      web: {
        match: 'Host("bazarr.davidfain.com")',
        port: 6767,
      },
      serviceProps: {
        image: 'lscr.io/linuxserver/bazarr:latest',
        deploy: {
          replicas: 1,
        },
        networks: {
          [this.webproxyNetwork.id(this)]: {},
        },
        volumes: [
          `/mnt/raid/0.SHARED/:/data`,
          `${this.volumes['bazarr-config'].id(this)}:/config`,
        ],
        environment: [
          ...keyValueFromConfig({
            PUID: 1000,
            PGID: 1000,
            TZ: this.timezone,
          }),
        ],
      }
    })

    new NodeSelector(jellyfin, AvailableNodes.Galactica);
    new NodeSelector(sonarr, AvailableNodes.Galactica);
    new NodeSelector(bazarr, AvailableNodes.Galactica);
    new NodeSelector(prowlarr, AvailableNodes.Galactica);
  }
}