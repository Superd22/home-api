import { Module } from '@nestjs/common';
import { AvailableNodes } from './charts/node-selector';
import { CommandYamlHelper } from './commands/command-yaml.service';
import { DeployCommand } from './commands/deploy.command';
import { PruneCommand } from './commands/prune.command';
import { SynthCommand } from './commands/synth.command';
import { Calibre } from './compose/calibre.compose';
import { DataDog } from './compose/datadog.compose';
import { DIYHue } from './compose/diyhue.compose';
import { Flood } from './compose/flood.compose';
import { Freebox } from './compose/freebox.compose';
import { HomeAssistant } from './compose/home-assistant.compose';
import { NetworkVolume } from './compose/internal/network-volume/network.volume';
import { VolumeSharerService } from './compose/internal/network-volume/volume-sharer.service';
import { HTPC } from './compose/htpc.compose';
import { MQTT } from './compose/mqtt.compose';
import { Plex } from './compose/plex/plex.compose';
import { Portainer } from './compose/portainer.compose';
import { Swarmpit } from './compose/swarmpit.compose';
import { Test } from './compose/test.compose';
import { TraefikService } from './compose/traefik/traefik.compose';
import { WebProxyNetwork } from './compose/traefik/webproxy.network';
import { Config } from './config.encrypted';
import { WebServiceFactory } from './services/web-service/web-service.factory';
import { SwarmApp } from './swarm.service';
import { DevicerService } from './compose/internal/devices/devicer.service';
import { MetadataExplorerService } from './services/metadatas/metadata-explorer.service';
import { Code } from './compose/internal/configuration/code.compose';
import { Backup } from './compose/internal/backup/backup.compose';
import { Satisfactory } from './compose/games/satisfactory.compose';
import { Auth } from './compose/auth.compose';

export const composes = [
  DataDog,
  HomeAssistant,
  Flood,
  Test,
  MQTT,
  Calibre,
  DIYHue,
  Freebox,
  HTPC,
  Satisfactory,
  Auth
];

export const dynamicComposes = [
  Backup,
  Code,
  VolumeSharerService,
  TraefikService
]

const commands = [SynthCommand, DeployCommand, PruneCommand];

@Module({
  imports: [],
  controllers: [],
  providers: [
    Config,
    SwarmApp,
    DevicerService,
    WebProxyNetwork,
    WebServiceFactory,
    CommandYamlHelper,
    MetadataExplorerService,
    ...dynamicComposes,
    ...composes,
    ...commands,
  ],
})
export class SwarmModule {
  constructor(
    protected readonly app: SwarmApp,
    protected readonly volumes: VolumeSharerService,
  ) {
    /**
     * @todo better way to create network volumes.
     */

    new NetworkVolume(undefined, 'test-switch-games', {
      node: AvailableNodes.Galactica,
      path: '/mnt/raid/0.SHARED/1.Games/Switch/',
    });

    new NetworkVolume(undefined, 'shared', {
      node: AvailableNodes.Galactica,
      path: '/mnt/raid/0.SHARED/',
    });
  }
}
