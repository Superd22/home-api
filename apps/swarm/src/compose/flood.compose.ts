import { Compose, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';

@Injectable()
/**
 * Flood + rTorrent seedbox
 */
export class Flood extends Compose {

  protected readonly _config = new Volume(this, 'config')

  protected readonly rtorrent = new Service(this, 'rtorent', {
    image: 'jesec/rtorrent',
    hostname: 'rtorrent',
    command: "-o network.port_range.set=6881-6881,system.daemon.set=true",
    ports: ['6881:6881'],
    environment: keyValueFromConfig({ HOME: '/config' }),
    user: '1000:1000',
    volumes: [
      `${this._config.id(this)}:/config`,
      "/mnt/raid/0.SHARED:/data",
    ]
  })

  protected readonly flood = new Service(undefined, 'flood', {
    image: 'jesec/flood',
    command: "--port 3001 --allowedpath /data",
    environment: keyValueFromConfig({ HOME: '/config' }),
    user: '1000:1000',
    volumes: [
      `${this._config.id(this)}:/config`,
      "/mnt/raid/0.SHARED:/data",
    ]
  })

  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, Flood.name, { version: '3.6', name: null });

    const service = this.web.webService(this, 'flood', {
      web: { match: 'Host(`torrent.davidfain.com`)', port: 3001 },
      serviceProps: {
        ...this.flood.props
      }
    });

    new NodeSelector(service, AvailableNodes.Galactica)
    new NodeSelector(this.rtorrent, AvailableNodes.Galactica)
  }
}
