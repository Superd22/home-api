import { App, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { WebService } from '../services/web-service/webservice.chart';
import { SwarmApp } from '../swarm.service';
import { WebProxyNetwork } from './traefik/webproxy.network';

@Injectable()
export class Debug extends Compose {
  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
    protected readonly network: WebProxyNetwork,
  ) {
    super(app, Debug.name, { version: '3.6', name: null });

    const service = new Service(this, 'debug', {
      image: 'alpine',
      command: 'sleep 10000000000000',
      networks: {
        [this.network.id(this)]: {},
      },
    });
    new Network(this, this.network.id(this), {
      external: { name: this.network.id(this) },
    }),
      new NodeSelector(service, AvailableNodes.Desktop);
  }
}
