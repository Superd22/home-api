import { Compose, Network, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { Config } from '../config.encrypted';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';
import { LaunchThroughComposeService } from './internal/dind/dind.service';

@Injectable()
/**
 * Centralized auth
 */
export class Auth extends Compose {

  protected readonly network = new Network(this, 'auth-network')

  protected readonly volumes = {
    pg: new Volume(this, 'pg-data'),
    authentik: {
      templates: new Volume(this, 'a-tmpl'),
      media: new Volume(this, 'media')
    }
  }

  protected readonly postgres = new Service(this, 'pg', {
    image: 'postgres:15.1',
    volumes: [
      this.volumes.pg.toService({ path: '/var/lib/postgresql/data' })
    ],
    healthcheck: {
      test: ["CMD-SHELL", "pg_isready -U postgres"],
      interval: '5s',
      timeout: '5s',
      retries: 5
    },
    environment: keyValueFromConfig({
      PGDATA: '/var/lib/postgresql/data/pgdata',
      POSTGRES_PASSWORD: this.config.auth.pg.password,
      POSTGRES_USER: this.config.auth.pg.user,
      POSTGRES_DB: 'auth'
    }),
    networks: {
      ...this.network.toService()
    }
  })

  protected readonly cache = new Service(this, 'cache', {
    image: 'redis:alpine',
    command: '--save 60 1 --loglevel warning',
    volumes: [new Volume(this, 'redis-data').toService({path: '/data'})],
    networks: {
      ...this.network.toService()
    }
  })


  protected readonly auth = this.web.webService(this, 'authentik', {
    web: {
      match: 'Host(`sso.davidfain.com`)',
      port: 9000,
    },
    serviceProps: {
      image: 'ghcr.io/goauthentik/server:2022.10',
      command: 'server',
      labels: keyValueFromConfig({
        'traefik.http.middlewares.testHeader.headers.customrequestheaders.X-Frame-Options':"",
        'traefik.http.middlewares.testHeader.headers.customresponseHeaders.X-Frame-Options':"",
        'traefik.http.middlewares.testHeader.headers.frameDeny':"false",
        'traefik.http.middlewares.testHeader.headers.framedeny':"false"
      }),
      deploy: {
        labels: keyValueFromConfig({
          // 'traefik.http.middlewares.testHeader.headers.customrequestheaders.X-Frame-Options':"",
          'traefik.http.middlewares.testHeader.headers.customrequestheaders.X-Frame-Options':"",
          'traefik.http.middlewares.testHeader.headers.customresponseHeaders.X-Frame-Options':"",
          'traefik.http.middlewares.testHeader.headers.frameDeny':"false",
          'traefik.http.middlewares.testHeader.headers.framedeny':"false"
        })
      },
      volumes: [
        this.volumes.authentik.media.toService({ path: '/media' }),
        this.volumes.authentik.templates.toService({ path: '/templates' }),
      ],
      environment: keyValueFromConfig({
        AUTHENTIK_REDIS__HOST: 'auth_cache',
        AUTHENTIK_POSTGRESQL__HOST: 'auth_pg',
        AUTHENTIK_POSTGRESQL__NAME: 'auth',
        AUTHENTIK_POSTGRESQL__USER: this.config.auth.pg.user,
        AUTHENTIK_POSTGRESQL__PASSWORD: this.config.auth.pg.password,
        AUTHENTIK_SECRET_KEY: this.config.auth.secret,
      }),
      networks: {
        ...this.network.toService()
      }
    }
  })


  protected readonly worker = new Service(this, 'worker', {
    image: 'ghcr.io/goauthentik/server:2022.10',
    command: 'worker',
    volumes: [
      this.volumes.authentik.media.toService({ path: '/media' }),
      this.volumes.authentik.templates.toService({ path: '/templates' }),
      '/var/run/docker.sock:/var/run/docker.sock'
    ],
    environment: keyValueFromConfig({
      AUTHENTIK_REDIS__HOST: 'auth_cache',
      AUTHENTIK_POSTGRESQL__HOST: 'auth_pg',
      AUTHENTIK_POSTGRESQL__NAME: 'auth',
      AUTHENTIK_POSTGRESQL__USER: this.config.auth.pg.user,
      AUTHENTIK_POSTGRESQL__PASSWORD: this.config.auth.pg.password,
      AUTHENTIK_SECRET_KEY: this.config.auth.secret,
    }),
    networks: {
      ...this.network.toService()
    }
  })


  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
    protected readonly config: Config
  ) {
    super(app, Auth.name, { version: '3.6', name: null });
    new NodeSelector(this.postgres, AvailableNodes.Galactica)
    new NodeSelector(this.auth, AvailableNodes.Galactica)
    new NodeSelector(this.worker, AvailableNodes.Galactica)
    new NodeSelector(this.cache, AvailableNodes.Galactica)
  }
}
