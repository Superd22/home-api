import { Compose, Network, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';

@Injectable()
export class Whipser extends Compose {

  protected readonly data = new Volume(this, 'data')
  protected readonly cache = new Volume(this, 'cache')
  protected readonly network = new Network(this, 'network')

  protected readonly whisperASR = new Service(this, 'asr', {
    image: 'onerahmet/openai-whisper-asr-webservice:latest-gpu',
    volumes: [this.cache.toService({ path: '/root/.cache/whisper' })],
    networks: {
      ...this.network.toService(this)
    },
    environment: keyValueFromConfig({
      ASR_MODEL: 'base'
    }),
    deploy: {
      replicas: 1,
      /** @todo gpu helper */
      // resources: {
      //   reservations: {
      //     generic_resources: [
      //       {
      //         discrete_resource_spec: {
      //           kind: 'NVIDIA-GPU',
      //           value: 0
      //         }
      //       }
      //     ]
      //   }
      // }
    }
  })

  protected readonly backend = this.web.webService(this, 'whisprbackend', {
    web: {
      match: "Host(`whisper.davidfain.com`) \u0026\u0026 PathPrefix(`/api`)", port: 3000
    },
    serviceProps: {   
      image: 'pluja/web-whisper-backend',
      volumes: [this.data.toService({path: '/app/db'})],
      deploy: {
        labels: {
          'traefik.http.routers.whisprbackend.middlewares': 'test-replacepathregex',
          'traefik.http.middlewares.test-replacepathregex.replacepathregex.regex': "^/api/(.*)",
          'traefik.http.middlewares.test-replacepathregex.replacepathregex.replacement': '/$$1'
        }
      },
      networks: {
        ...this.network.toService(this)
      },
      environment: keyValueFromConfig({
        UPLOAD_DIR: '/tmp',
        WHISPER_MODEL: 'base',
        ASR_ENDPOINT: 'asr:9000',
        LT_LOAD_ONLY: 'en,fr',
        DB_BACKEND: 'sqlite',
      })
    }
  })
  
  protected readonly translate = new Service(this, 'translate', {
    image: 'libretranslate/libretranslate:latest',
    tty: true,
    networks: {
      ...this.network.toService(this)
    },
    environment: keyValueFromConfig({
      LT_DISABLE_WEB_UI: true,
      LT_UPDATE_MODELS: true,
      LT_LOAD_ONLY: 'en,fr',
    })
  })

  protected readonly webui = this.web.webService(this, 'ui', {
    web: {
      match: 'Host(`whisper.davidfain.com`)', port: 5173
    },
    serviceProps: {
      image: 'pluja/web-whisper-frontend',
      networks: {
        ...this.network.toService(this)
      },
      environment: keyValueFromConfig({
        UPLOAD_DIR: '/tmp',
        WHISPER_MODEL: 'base',
        LT_LOAD_ONLY: 'en,fr',
        ASR_ENDPOINT: 'asr:9000'
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
    new NodeSelector(this.translate, AvailableNodes.Desktop)
  }
}
