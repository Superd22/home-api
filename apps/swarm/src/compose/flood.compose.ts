import { Compose } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';

@Injectable()
/**
 * Flood + rTorrent seedbox
 */
export class Flood extends Compose {

  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, Flood.name, { version: '3.6', name: null });

    const service = this.web.webService(this, 'flood', {
      web: { match: 'Host(`torrent.davidfain.com`)', port: 3000 },
      serviceProps: {
        image: 'superd22/flood',
        volumes: [
          // @todo move this to named volume?
          "/mnt/raid/0.SHARED:/data",
          "/home/opt/flood/db:/flood-db",
          "/home/opt/flood/rtorrent:/config/rtorrent",
        ],
      },
    });

    new NodeSelector(service, AvailableNodes.Galactica)
  }
}
