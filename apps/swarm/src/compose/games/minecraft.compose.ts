import { Compose, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../../charts/node-selector';
import { keyValueFromConfig } from '../../charts/utils/kv-from-config.util';
import { SwarmApp } from '../../swarm.service';
import { AutoUpdate } from '../internal/updater';
import { GameService, ReverseProxiedPort } from './_.server';
import { TraefikService } from '../traefik/traefik.compose';
import { WebServiceFactory } from '../../services/web-service/web-service.factory';

@Injectable()
/**
 * Minecraft server because victor loves minecraft
 * FTB
 */
export class Minecraft extends Compose {
  protected readonly volume = new Volume(this, 'minecraft-ftb');

  // handle manually added mods
  // https://mediafilez.forgecdn.net/files/4742/643/PacketFixer-forge-1.1.7-1.19.2.jar
  // https://mediafilez.forgecdn.net/files/4765/911/Dynmap-3.7-beta-1-forge-1.19.2.jar
  protected modpack = {
    packId: 97,
    versionId: 6482,
  };

  protected ports: ReverseProxiedPort[] = ['25565/tcp', '25565/udp'];

  @AutoUpdate()
  protected readonly server = new GameService(
    this,
    'minecraft',
    {
      service: {
        image: 'itzg/minecraft-server:java17',
        expose: [...this.ports, 8123],
        healthcheck: {
          start_period: '5m',
        },
        deploy: {
          replicas: 1,
        },
        volumes: [this.volume.toService({ path: '/data' })],
        environment: keyValueFromConfig({
          EULA: 'TRUE',
          FTB_MODPACK_ID: this.modpack.packId,
          FTB_MODPACK_VERSION_ID: this.modpack.versionId,
          TYPE: 'FTBA',
          MEMORY: '20G',
        }),
      },
      ports: this.ports,
    },
    this.traefik,
    this.networkFactory
  );

  constructor(
    protected readonly app: SwarmApp,
    protected readonly traefik: TraefikService,
    protected readonly networkFactory: WebServiceFactory
  ) {
    super(app, 'minecraft', {
      version: '3.6',
      name: null,
    });

    // @todo, something better than this to auto move
    // will have to handle network storage aswell
    new NodeSelector(this.server, AvailableNodes.Desktop);

    // add dynmap access
    this.networkFactory.webAccess(this.server, {
      match: "Host(`map.minecraft.davidfain.com`)",
      port: 8123,
      routerName: 'dynmap'
    });
  }
}
