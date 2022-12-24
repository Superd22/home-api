import { Compose, Network, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { Config } from '../config.encrypted';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';

@Injectable()
export class HomeAPI extends Compose {

  protected network = new Network(this, 'homeapi');

  protected api = this.web.webService(this, 'api', {
    web: {
      match: "Host(`api.home.davidfain.com`)",
      port: 3000,
    },
    serviceProps: {
      image: 'ghcr.io/superd22/home-api/api:latest',
      deploy: {
        labels: keyValueFromConfig({
          "dockupdater.latest": true,
          "dockupdater.enable": true,
        })
      },
      networks: {
        ...this.network.toService()
      },
    }
  })

  protected readonly postgres = new Service(this, 'pg', {
    image: 'postgres:15.1',
    volumes: [
      new Volume(this, 'pg-data').toService({ path: '/var/lib/postgresql/data' })
    ],
    healthcheck: {
      test: ["CMD-SHELL", "pg_isready -U postgres"],
      interval: '5s',
      timeout: '5s',
      retries: 5
    },
    environment: keyValueFromConfig({
      PGDATA: '/var/lib/postgresql/data/pgdata',
      POSTGRES_PASSWORD: this.config.homeapi.pg.password,
      POSTGRES_USER: this.config.homeapi.pg.user,
      POSTGRES_DB: 'homeapi'
    }),
    networks: {
      ...this.network.toService()
    }
  })
  
  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
    protected readonly config: Config,
  ) {
    super(app, HomeAPI.name, { version: '3.6', name: null });
    new NodeSelector(this.api, AvailableNodes.HomeAPI)
    new NodeSelector(this.postgres, AvailableNodes.Galactica)
  }

}


