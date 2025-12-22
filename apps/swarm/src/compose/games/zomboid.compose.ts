//
import { Compose, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../../charts/node-selector';
import { keyValueFromConfig } from '../../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../../services/web-service/web-service.factory';
import { SwarmApp } from '../../swarm.service';
import { AutoUpdate } from '../internal';
import { TraefikService } from '../traefik/traefik.compose';
import { WebProxyNetwork } from '../traefik/webproxy.network';
import { GameService, ReverseProxiedPort } from './_.server';

@Injectable()
export class Zomboid extends Compose {
  protected readonly ports: ReverseProxiedPort[] = ['16261/udp', '16262/udp'];

  protected readonly configVolume = new Volume(this, 'config');
  protected readonly gameVolume = new Volume(this, 'game');

  @AutoUpdate()
  protected readonly server = new GameService(
    this,
    'server',
    {
      service: {
        image: 'ghcr.io/renegade-master/zomboid-dedicated-server:2.5.0',
        expose: [...this.ports, '27015/udp'],
        volumes: [
          this.configVolume.toService({ path: '/ZomboidConfig' }),
          this.gameVolume.toService({ path: '/ZomboidDedicatedServer' }),
        ],
        environment: keyValueFromConfig({
          SERVER_NAME: 'The big D',
          SERVER_PASSWORD: 'azerty123',
          GAME_VERSION: '42.13.1',
        }),
        deploy: {
          replicas: 1,
        },
      },
      ports: this.ports,
    },
    this.traefik,
    this.webservice
  );

  constructor(
    protected readonly app: SwarmApp,
    protected readonly traefik: TraefikService,
    protected readonly network: WebProxyNetwork,
    protected readonly webservice: WebServiceFactory
  ) {
    super(app, 'zomboid', {
      version: '3.6',
      name: null,
    });
    new NodeSelector(this.server, AvailableNodes.Desktop);
  }
}
