import { App, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../../charts/node-selector';
import { keyValueFromConfig } from '../../charts/utils/kv-from-config.util';
import { Config } from '../../config.encrypted';
import { WebServiceFactory } from '../../services/web-service/web-service.factory';
import { WebService } from '../../services/web-service/webservice.chart';
import { SwarmApp } from '../../swarm.service';
import { TraefikV2 } from './traefik-v2';

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

  constructor(
    app: SwarmApp,
    protected readonly appConfig: Config,
  ) {
    super(app, Traefik.name, { version: "3.8", name: null });

    new Volume(this, 'traefik-letsencrypt', null);

    const service = new Service(this, 'reverse-proxy', {
      image: 'traefik:latest',
      ports: ['443:443', '80:80', '8080:8080'].map(p => {
        const [_, containerPort, hostPort, protocol] = p.match(/([0-9]+):([0-9]+)/)
        return {
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
          command: keyValueFromConfig({
            "auth-host": "auth.davidfain.com",
            "cookie-domain": "davidfain.com",
            whitelist: "superd001@gmail.com",
            secret: this.appConfig.traefik.auth.secret,
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
          }).map(keyVal => {
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
