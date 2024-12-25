import { App, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../../charts/node-selector';
import { keyValueFromConfig } from '../../charts/utils/kv-from-config.util';
import { Config } from '../../config.encrypted';
import { ISynthAfterCompose, SynthAfterCompose } from '../../services/metadatas/after-compose.decorator';
import { WebServiceFactory } from '../../services/web-service/web-service.factory';
import { WebService } from '../../services/web-service/webservice.chart';
import { SwarmApp } from '../../swarm.service';
import { Entrypoint as TraefikEntry, TraefikV2 } from './traefik-v2';

@Injectable()
@SynthAfterCompose()
export class TraefikService implements ISynthAfterCompose {

  protected logger = new Logger('TraefikService')

  private Traefik = class Traefik extends Compose {
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
        web: { address: ':80', },
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

    constructor(
      protected readonly app: SwarmApp,
      protected readonly appConfig: Config,
      protected readonly additionalEntryPoints: { [name: string]: { address: string } } = {}
    ) {
      super(app, Traefik.name, { version: "3.8", name: null });

      new Volume(this, 'traefik-letsencrypt', null);
      new Network(this, 'webproxy', { attachable: true })

      Object.assign(this.config.entryPoints, additionalEntryPoints)

      const service = new Service(this, 'reverse-proxy', {
        image: 'traefik:v2.11.8',
        ports: ['443:443', '80:80', '8080:8080']
          .concat(
            Object.values(this.additionalEntryPoints)
              //                      1234/udp into 1234:1234/udp
              .map(({ address }) => address.replace(':', ''))
              .map(address => `${address.split('/')[0]}:${address}`)
          )
          .map(p => {
            const [_, containerPort, hostPort, protocol] = p.match(/([0-9]+):([0-9]+)(?:\/(.+))?/)
            return {
              protocol,
              target: Number(containerPort),
              published: Number(hostPort),
              mode: 'host'
            } as Port
          }) as Port[],
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

  const commands = [
    ...keyValueFromConfig({
      "auth-host": "auth.davidfain.com",
      "cookie-domain": "davidfain.com",
      secret: this.appConfig.traefik.auth.secret,
      'match-whitelist-or-domain': null,
      'log-level': 'debug',
      providers: {
        google: {
          'client-id': this.appConfig.traefik.auth.providers.google.clientId,
          'client-secret': this.appConfig.traefik.auth.providers.google.clientSecret
        },
        "generic-oauth": {
          "auth-url": "https://github.com/login/oauth/authorize",
          "token-url": "https://github.com/login/oauth/access_token",
          "user-url": "https://api.github.com/user",
          "client-id": this.appConfig.traefik.auth.providers.github.clientId,
          "client-secret": this.appConfig.traefik.auth.providers.github.clientSecret
        }
      }
    }),
    ...this.appConfig.traefik.auth.domain.flatMap(
      domain => keyValueFromConfig({ domain })
    ),
    ...this.appConfig.traefik.auth.whitelist.flatMap(
      whitelist => keyValueFromConfig({ whitelist })
    ),
  ]

      const forwardAuth = new WebService(
        this,
        "forward-auth",
        {
          serviceProps: {
            image: 'npawelek/traefik-forward-auth',
            deploy: {
              labels: keyValueFromConfig({
                traefik: {
                  http: {
                    routers: {
                      "forward-auth": {
                        middlewares: "forward-auth"
                      },
                    },
                    middlewares: {
                      'forward-auth': {
                        forwardauth: {
                          address: `http://traefik_forward-auth:4181`,
                          authResponseHeaders: "X-Forwarded-User",
                          trustForwardHeader: true,
                        }
                      }
                    }
                  }
                }
              }),
            },
            networks: {
              // @todo better API for dis?
              webproxy: null,
            },
            command: commands.map(keyVal => {
              keyVal.key = `--${keyVal.key}`
              return keyVal
            })
          },
          web: {
            match: "Host(`auth.davidfain.com`)",
            port: 4181
          }
        }
      )

      new NodeSelector(service, AvailableNodes.HomeAPI)
    }
  }


  protected ports: { [k: string]: Entrypoint } = {}

  constructor(
    protected readonly app: SwarmApp,
    protected readonly appConfig: Config,
  ) {

  }

  public declareEntryPoints(entrypoints: [name: string, entryPoint: Entrypoint][]) {
    for (const [name, entry] of entrypoints) {
      this.logger.debug(`Declaring entrypoint ${name} ${entry.address}`)
      this.ports[name] = entry
    }
  }

  synth(): Compose {
    return new this.Traefik(this.app, this.appConfig, this.ports)
  }
}

export interface Entrypoint extends TraefikEntry {
  address: string;
}