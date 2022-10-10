import { App, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../../charts/node-selector';
import { WebServiceFactory } from '../../services/web-service/web-service.factory';
import { WebService } from '../../services/web-service/webservice.chart';
import { SwarmApp } from '../../swarm.service';

@Injectable()
export class WindowsAdminCenter extends Compose {
  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, WindowsAdminCenter.name, { version: '3.6', name: null });

    for (const node of Object.values(AvailableNodes)) {
      const service = this.web.webService(this, `test-${node}`, {
        web: { match: `Host(\`test.${node}.home.davidfain.com\`)`, allowHttp: true, port: 80, requiresAuth: true },
        serviceProps: {
          image: 'strm/helloworld-http',
          ports: ['80']
        },
      });

      new NodeSelector(service, node)
    }
  }
}
