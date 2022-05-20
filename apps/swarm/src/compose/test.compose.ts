import { App, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { WebService } from '../services/web-service/webservice.chart';
import { SwarmApp } from '../swarm.service';

@Injectable()
export class Test extends Compose {
  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, Test.name, { version: '3.6', name: null });

    const service = this.web.webService(this, 'test', {
      web: { match: 'Host(`test.home.davidfain.com`)', port: 80 },
      serviceProps: {
        image: 'strm/helloworld-http',
        ports: ['80']
      },
    });

    new NodeSelector(service, AvailableNodes.Galactica)
  }
}
