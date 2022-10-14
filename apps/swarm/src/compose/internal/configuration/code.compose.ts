import { Compose, Service, Volume } from '@homeapi/ctsdk';
import { DefinitionsService } from '@homeapi/ctsdk/docker/compose-v3';
import { Injectable } from '@nestjs/common';
import { ISynthAfterCompose, SynthAfterCompose } from 'apps/swarm/src/services/metadatas/after-compose.decorator';
import { AvailableNodes, NodeSelector } from '../../../charts/node-selector';
import { keyValueFromConfig } from '../../../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../../../services/web-service/web-service.factory';
import { SwarmApp } from '../../../swarm.service';
import { EditableVolume } from './editable-volume.construct';

@Injectable()
@SynthAfterCompose()
export class Code implements ISynthAfterCompose {

  protected static editableVolumes: EditableVolume[] = []

  public static registerVolume(volume: EditableVolume) {
    console.log("register", volume)
    Code.editableVolumes.push(volume)
  }

  private CodeCompose = class CodeCompose extends Compose {
    constructor(
      protected readonly app: SwarmApp,
      protected readonly web: WebServiceFactory,
    ) {
      super(app, Code.name, { version: '3.6', name: null });
      new NodeSelector(this.code, AvailableNodes.Galactica)

      Code.editableVolumes.forEach(volume => this.addConstruct(volume.networkVolume))

      console.log('hm', this.internals, this.internals[this.internals.length - 1].id(this))
    }

    protected readonly _config = new Volume(this, 'config')

    protected readonly code = this.web.webService(this, 'code', {
      web: {
        match: 'Host(`code.davidfain.com`)',
        port: 8443,
        requiresAuth: true,
      },
      serviceProps: {
        image: 'lscr.io/linuxserver/code-server:4.7.0', // update docker engine to go to latest
        ports: ['8443:8443'],
        volumes: [
          `${this._config.id(this)}:/config`,
          ...this.getVolumes(),
        ],
        environment: keyValueFromConfig({
          PUID: 1000,
          PGID: 1000,
          TZ: 'Europe/Paris',
        })
      }
    })

    protected getVolumes(): DefinitionsService['volumes'] {
      return Code.editableVolumes.map(volume => `${volume.networkVolume.id()}:/data/${volume.networkVolume.id()}`)
    }
  }



  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
  }

  public synth(): Compose {
    return new this.CodeCompose(this.app, this.web)
  }

}
