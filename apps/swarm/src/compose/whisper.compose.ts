import { Compose, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';

@Injectable()
export class Whipser extends Compose {

  protected readonly data = new Volume(this, 'data')
  protected readonly cache = new Volume(this, 'cache')

  protected readonly whisperASR = new Service(this, 'asr', {
    image: 'onerahmet/openai-whisper-asr-webservice:latest-gpu',
    volumes: [this.cache.toService({ path: '/root/.cache/whisper' })],
    environment: keyValueFromConfig({
      ASR_MODEL: 'base'
    }),
    deploy: {
      replicas: 1,
      /** @todo gpu helper */
      resources: {
        reservations: {
          generic_resources: [
            {
              discrete_resource_spec: {
                kind: 'NVIDIA-GPU',
                value: 0
              }
            }
          ]
        }
      }
    }
  })

  protected readonly backend = new Service(this, 'backend', {
    image: 'pluja/web-whisper-backend',
    volumes: [this.data.toService({path: '/app/db'})],
    environment: keyValueFromConfig({
      UPLOAD_DIR: '/tmp',
      WHISPER_MODEL: 'base',
      ASR_ENDPOINT: 'whisper_asr:9000'
    })
  })
  

  protected readonly webui = this.web.webService(this, 'ui', {
    web: {
      match: 'Host(`whisper.davidfain.com`)', port: 5173
    },
    serviceProps: {
      image: 'pluja/web-whisper-frontend',
      environment: keyValueFromConfig({
        UPLOAD_DIR: '/tmp',
        WHISPER_MODEL: 'base',
        ASR_ENDPOINT: 'whisper_asr:9000'
      })
    },
  }) 

  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, Whipser.name, { version: '3.6', name: null });

    new NodeSelector(this.backend, AvailableNodes.Desktop)
    new NodeSelector(this.whisperASR, AvailableNodes.Desktop)
    new NodeSelector(this.webui, AvailableNodes.Desktop)
  }
}
