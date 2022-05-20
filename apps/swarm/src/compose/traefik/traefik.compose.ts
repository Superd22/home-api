import { App, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../../charts/node-selector';
import { keyValueFromConfig } from '../../charts/utils/kv-from-config.util';
import { SwarmApp } from '../../swarm.service';
import { TraefikV2 } from './traefik-v2';
import { WebProxyNetwork } from './webproxy.network';

@Injectable()
export class Traefik extends Compose {
  /** traefik config */
  protected readonly config: TraefikV2 = {
    api: {
      insecure: true,
    },
    accessLog: {
      format: 'json',
    },
    certificatesResolvers: {
      le: {
        acme: {
          email: 'superd001@gmail.com',
          tlsChallenge: true,
          httpChallenge: {
            entryPoint: 'web',
          },
          storage: '/letsencrypt/acme.json',
        },
      },
    },
    entryPoints: {
      web: { address: ':80' },
      websecure: { address: ':443' },
    },
    providers: {
      docker: {
        watch: true,
        exposedByDefault: true,
        swarmMode: true,
        network: 'traefik_webproxy',
      },
    },
    log: {
      level: 'DEBUG',
      format: 'json',
    },
  };

  constructor(app: SwarmApp) {
    super(app, Traefik.name, { version: "3.8", name: null });

    new Volume(this, 'traefik-letsencrypt', null);

    const service = new Service(this, 'reverse-proxy', {
      image: 'traefik:latest',
      ports: ['443:443', '80:80', '8080:8080'],
      volumes: [
        '/var/run/docker.sock:/var/run/docker.sock',
        'traefik-letsencrypt:/letsencrypt',
      ],
      networks: {
        // @todo better API for dis?
        webproxy: null,
      },
      command: keyValueFromConfig({ ...this.config }).map((keyVal) => {
        keyVal.key = `--${keyVal.key}`;
        return keyVal;
      }),
    });

    new NodeSelector(service, AvailableNodes.HomeAPI)
  }
}
