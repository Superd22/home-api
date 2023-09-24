import { Compose, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';
import { AutoUpdate } from './internal';

@Injectable()
/**
 * Calibre + CalibreWeb for ebook management
 * @todo
 */
export class Calibre extends Compose {

  protected readonly timezone = 'Europe/Paris';
  protected readonly webData = new Volume(this, 'web-data')
  protected readonly volumes = {
    'readarr-config': new Volume(
      this,
      'readarr-config',
    ),
  }


  @AutoUpdate()
  protected readonly readarr = this.web.webService(this, 'readarr', {
    web: {
      match: 'Host("readarr.davidfain.com")',
      port: 8787,
    },
    serviceProps: {
      image: 'lscr.io/linuxserver/readarr:develop',
      deploy: {
        replicas: 1,
      },
      volumes: [
        `/mnt/raid/0.SHARED/:/data`,
        `${this.volumes['readarr-config'].id(this)}:/config`,
      ],
      environment: [
        ...keyValueFromConfig({
          PUID: 1000,
          PGID: 1000,
          TZ: this.timezone,
        }),
      ],
    }
  })

  @AutoUpdate()
  protected readonly calibre = this.web.webService(this, 'calibre', {
    web: { match: 'Host(`calibre.davidfain.com`)', port: 8080 },
    serviceProps: {
      image: 'lscr.io/linuxserver/calibre:latest',
      environment: keyValueFromConfig({
        PUID: 1000,
        PGID: 1000,
        TZ: this.timezone,
      }),
      volumes: [
        "/mnt/raid/0.SHARED/3.Books/:/config",
      ],
    },
  });

  protected readonly calibreWeb = this.web.webService(this, 'calibre-web', {
    web: { match: 'Host(`books.davidfain.com`)', port: 8083, allowHttp: true },
    serviceProps: {
      image: 'ghcr.io/linuxserver/calibre-web',
      environment: keyValueFromConfig({
        PUID: 1000,
        PGID: 1000,
        TZ: this.timezone,
        DOCKER_MODS: "linuxserver/calibre-web:calibre"
      }),
      volumes: [
        `${this.webData.id(this)}:/config`,
        "/mnt/raid/0.SHARED/3.Books/Calibre Library/:/books",
      ]
    },
  });

  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, Calibre.name, { version: '3.6', name: null });
    this.web.webAccess(this.calibre, { routerName: 'calibre-web-legacy', match: 'Host(`calibre-web.davidfain.com`)', port: 8081 })
    new NodeSelector(this.calibre, AvailableNodes.Galactica)
    new NodeSelector(this.calibreWeb, AvailableNodes.Galactica)
    new NodeSelector(this.readarr, AvailableNodes.Galactica)
  }
}
