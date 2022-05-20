import { App, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { WebService } from '../services/web-service/webservice.chart';
import { SwarmApp } from '../swarm.service';

@Injectable()
export class HomeAssistant extends Compose {
  constructor(
    app: SwarmApp,
    protected readonly webServiceFactory: WebServiceFactory,
  ) {
    super(app, HomeAssistant.name, { name: null, version: "3.8" });

    new Volume(this, 'homeassistant', null);

    const service = this.webServiceFactory.webService(this, 'homeassistant', {
      web: { match: 'Host(`home.davidfain.com`)', port: 8123, allowHttp: true },
      serviceProps: {
        image: 'ghcr.io/home-assistant/home-assistant:stable',
        volumes: ['homeassistant:/config'],
      },
    });


    new NodeSelector(service, AvailableNodes.HomeAPI)
  }
}
