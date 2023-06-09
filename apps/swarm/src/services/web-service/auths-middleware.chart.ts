import { Injectable } from "@nestjs/common";
import { ISynthAfterCompose, SynthAfterCompose } from "../metadatas/after-compose.decorator";
import { Compose } from "@homeapi/ctsdk";
import { SwarmApp } from "../../swarm.service";
import { WebService } from "./webservice.chart";
import { keyValueFromConfig } from "../../charts/utils/kv-from-config.util";
import { createHash } from 'crypto'
import { Config } from "../../config.encrypted";

  @Injectable()
  @SynthAfterCompose()
  export class AuthMiddlewares implements ISynthAfterCompose {

    
    public static readonly instance: AuthMiddlewares;

    protected readonly requiredAuths = new Map<string, AuthRule>()

    public constructor(
      protected readonly app: SwarmApp,
      protected readonly appConfig: Config,
    ) {
      if (AuthMiddlewares.instance) return AuthMiddlewares.instance;
      else {
        (AuthMiddlewares as any).instance = this;
      }
    }

    public registerRule(rule: AuthRule) {
      this.requiredAuths.set(rule.id, rule);
    }

    synth(): Compose {
      const middlewareCompose = new Compose(this.app, 'auth-middlewares', {version: '3.6', name: null});

      for (const rule of this.requiredAuths.values()) {
        this.middlewareFactory(middlewareCompose, rule);
      }

      return middlewareCompose
    }

    protected middlewareFactory(compose: Compose, rule: AuthRule): WebService {
      return new WebService(
        compose,
        "forward-auth" + rule.id,
        {
          serviceProps: {
            image: 'npawelek/traefik-forward-auth',
            deploy: {
              labels: keyValueFromConfig({
                traefik: {
                  http: {
                    routers: {
                      ["forward-auth"+rule.id]: {
                        middlewares: "forward-auth" + rule.id
                      },
                    },
                    middlewares: {
                      ['forward-auth' + rule.id]: {
                        forwardauth: {
                          address: `http://auth-middlewares_forward-auth${rule.id}:4181`,
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
            match: "Host(`"+rule.id+".davidfain.com`)",
            port: 4181
          }
        }
      )
    }

}

export class AuthRule {

  public constructor(args: {
    domains: string[]
  })
  public constructor(args: {
    whitelist: string []
  })
  public constructor(
    public readonly domainsOrWhiteList: { domains: string[] } | { whitelist: string[] }
  ) {}

  public get id(): `whitelist-${string}` | `domains-${string}` {

    return `${this.type}-${createHash('md5').update(
      this.domainsOrWhiteList[this.type].join('-')
    ).digest("hex")}`
  }

  public get type(): 'whitelist' | 'domains' {
    return this.domainsOrWhiteList['whitelist'] ? 'whitelist' : 'domains'
  }



}