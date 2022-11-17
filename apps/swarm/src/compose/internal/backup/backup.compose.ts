import { Compose, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { ISynthAfterCompose, SynthAfterCompose } from 'apps/swarm/src/services/metadatas/after-compose.decorator';
import { AvailableNodes, NodeSelector } from '../../../charts/node-selector';
import { keyValueFromConfig } from '../../../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../../../services/web-service/web-service.factory';
import { SwarmApp } from '../../../swarm.service';
import { EditableVolume } from '../configuration/editable-volume.construct';

@Injectable()
@SynthAfterCompose()
export class Backup implements ISynthAfterCompose {



  private Duplicati = class Duplicati extends Compose {
    constructor(
      protected readonly app: SwarmApp,
      protected readonly web: WebServiceFactory,
    ) {
      super(app, Backup.name, { version: '3.6', name: null });
      new NodeSelector(this.duplicati, AvailableNodes.Galactica)
    }

    protected readonly _config = new EditableVolume(this, 'config', AvailableNodes.Galactica)

    protected readonly duplicati = this.web.webService(this, 'duplicati', {
      web: {
        match: 'Host(`backup.davidfain.com`)',
        port: 8200,
        requiresAuth: true,
      },
      serviceProps: {
        image: 'lscr.io/linuxserver/duplicati:latest',
        volumes: [
          this._config.toService({ path: '/config' })
        ],
        environment: keyValueFromConfig({
          PUID: 1000,
          PGID: 1000,
          TZ: 'Europe/Paris',
        })
      }
    })

  }



  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
  }

  public synth(): Compose {
    return new this.Duplicati(this.app, this.web)
  }

}
