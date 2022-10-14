import { App, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { WebService } from '../services/web-service/webservice.chart';
import { SwarmApp } from '../swarm.service';
import { EditableVolume } from './internal/configuration/editable-volume.construct';

@Injectable()
export class HomeAssistant extends Compose {
  constructor(
    app: SwarmApp,
    protected readonly webServiceFactory: WebServiceFactory,
  ) {
    super(app, HomeAssistant.name, { name: null, version: "3.8" });

    new EditableVolume(this, 'homeassistant', AvailableNodes.HomeAPI);

    const service = this.webServiceFactory.webService(this, 'homeassistant', {
      web: { match: 'Host(`home.davidfain.com`)', port: 8123, allowHttp: true },
      serviceProps: {
        image: 'linuxserver/homeassistant:latest',
        volumes: ['homeassistant:/config'],
        environment: keyValueFromConfig({
          PUID: 1000,
          PGID: 1000,
        })
      },
    });


    new NodeSelector(service, AvailableNodes.HomeAPI)
  }
}
