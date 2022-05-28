import { Compose, Network, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';

@Injectable()
/**
 * Docker swarm monitoring with Portainer.io
 */
export class Portainer extends Compose {
  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, Portainer.name, { version: '3.6', name: null });

    const network = new Network(this, 'portainer', { driver: 'overlay', attachable: true })

    new Service(this, 'agent', {
      image: 'portainer/agent:2.13.0',
      volumes: [
        '/var/run/docker.sock:/var/run/docker.sock',
        '/var/lib/docker/volumes:/var/lib/docker/volumes',
      ],
      deploy: {
        mode: 'global'
      },
      networks: {
        [network.id(this)]: {}
      }
    });

    const data = new Volume(this, 'data')

    const service = this.web.webService(this, 'portainer', {
      web: { match: 'Host(`portainer.davidfain.com`)', port: 9000 },
      serviceProps: {
        image: 'portainer/portainer-ce:2.13.0',
        command: "-H tcp://tasks.agent:9001 --tlsskipverify",
        volumes: [
          `${data.id(this)}:/data`
        ],
        deploy: {
          mode: 'replicated',
          replicas: 1,
        },
        networks: {
          [network.id(this)]: {}
        }
      },
    });

    new NodeSelector(service, AvailableNodes.HomeAPI);
  }
}
