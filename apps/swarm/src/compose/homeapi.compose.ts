import { Compose } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';

@Injectable()
export class HomeAPI extends Compose {

  protected api = this.web.webService(this, 'api', {
    web: {
      match: "Host(`api.home.davidfain.com`)",
      port: 3000,
    },
    serviceProps: {
      image: 'ghcr.io/superd22/home-api/api:latest',
      deploy: {
        labels: {
          "dockupdater.enable": true,
        }
      }
    }
  })

  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, HomeAPI.name, { version: '3.6', name: null });
    new NodeSelector(this.api, AvailableNodes.HomeAPI)
  }

}


