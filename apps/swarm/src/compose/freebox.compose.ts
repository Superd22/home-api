import { Compose, Network, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';
import { LaunchThroughComposeService } from './internal/dind/dind.service';

@Injectable()
/**
 * Expose freebox interface in docker network
 */
export class Freebox extends Compose {

  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, Freebox.name, { version: '3.6', name: null });


    const freeboxhome = this.web.webService(this, 'freebox', {
      web: { match: 'Host(`freebox.davidfain.com`)', requiresAuth: true },
      serviceProps: {
        image: 'haproxy',
        environment: keyValueFromConfig({
          LISTEN: ':80',
          TALK: "192.168.1.254:80"
        })
      }
    })

    new NodeSelector(freeboxhome, AvailableNodes.HomeAPI)

  }
}
