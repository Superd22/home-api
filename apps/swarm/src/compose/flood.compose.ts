import { Compose, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';
import { EditableVolume } from './internal/configuration/editable-volume.construct';
import { AutoUpdate } from './internal';

@Injectable()
/**
 * Flood + rTorrent seedbox
 */
export class Flood extends Compose {

  protected readonly _config = new EditableVolume(this, 'config', AvailableNodes.Galactica)
  protected readonly _nzbConfig = new Volume(this, 'confignzb')

  @AutoUpdate()
  protected readonly rtorrent = new Service(this, 'rtorent', {
    image: 'jesec/rtorrent',
    hostname: 'rtorrent',
    command: "-o network.port_range.set=6881-6881,system.daemon.set=true",
    ports: ['6881:6881'],
    environment: keyValueFromConfig({ HOME: '/config' }),
    user: '1000:1000',
    volumes: [
      this._config.toService({ path: '/config' }),
      "/mnt/raid/0.SHARED:/data",
    ]
  })

  @AutoUpdate()
  protected readonly flood = this.web.webService(this, 'flood', {
    web: { match: 'Host(`torrent.davidfain.com`)', port: 3001 },
    serviceProps: {
      image: 'jesec/flood',
      command: "--port 3001 --allowedpath /data",
      environment: keyValueFromConfig({ HOME: '/config' }),
      user: '1000:1000',
      volumes: [
        this._config.toService({ path: '/config' }),
        "/mnt/raid/0.SHARED:/data",
      ]
    }
  })

  @AutoUpdate()
  protected readonly sabnzbd = this.web.webService(this, 'sabnzbd', {
    web: { match: 'Host(`nzb.davidfain.com`)', port: 8080 },
    serviceProps: {
      image: 'lscr.io/linuxserver/sabnzbd:latest',
      environment: keyValueFromConfig({ PUID: 1000, PGID: 1000, TZ: 'Europe/Paris' }),
      volumes: [
        this._nzbConfig.toService({ path: '/config' }),
        "/mnt/raid/0.SHARED:/data"
      ]
    }
  })

  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, Flood.name, { version: '3.6', name: null });

    new NodeSelector(this.flood, AvailableNodes.Galactica)
    new NodeSelector(this.rtorrent, AvailableNodes.Galactica)
    new NodeSelector(this.sabnzbd, AvailableNodes.Galactica)
  }
}
