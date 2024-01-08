import { Module } from '@nestjs/common';
import { AvailableNodes } from './charts/node-selector';
import { CommandYamlHelper } from './commands/command-yaml.service';
import { DeployCommand } from './commands/deploy.command';
import { PruneCommand } from './commands/prune.command';
import { SynthCommand } from './commands/synth.command';
import { Calibre } from './compose/calibre.compose';
import { DIYHue } from './compose/diyhue.compose';
import { Docugen } from './compose/docugen.compose';
import { Flood } from './compose/flood.compose';
import { Minecraft } from './compose/games/minecraft.compose';
import { HomeAssistant } from './compose/home-assistant.compose';
import { HomeAPI } from './compose/homeapi.compose';
import { HTPC } from './compose/htpc.compose';
import { Backup } from './compose/internal/backup/backup.compose';
import { Code } from './compose/internal/configuration/code.compose';
import { DevicerService } from './compose/internal/devices/devicer.service';
import { NetworkVolume } from './compose/internal/network-volume/network.volume';
import { VolumeSharerService } from './compose/internal/network-volume/volume-sharer.service';
import { Updater } from './compose/internal/updater/updater.compose';
import { MQTT } from './compose/mqtt.compose';
import { Test } from './compose/test.compose';
import { TraefikService } from './compose/traefik/traefik.compose';
import { WebProxyNetwork } from './compose/traefik/webproxy.network';
import { Whipser } from './compose/whisper.compose';
import { Config } from './config.encrypted';
import { MetadataExplorerService } from './services/metadatas/metadata-explorer.service';
import { WebServiceFactory } from './services/web-service/web-service.factory';
import { SwarmApp } from './swarm.service';

export const composes = [
  // DataDog,
  // Calibre,
  HomeAssistant,
  Flood,
  Test,
  MQTT,
  Calibre,
  DIYHue,
  HTPC,
  // Satisfactory,
  // Auth,
  Updater,
  HomeAPI,
  Whipser,
  Docugen,
  Minecraft
];

export const dynamicComposes = [
  Backup,
  Code,
  VolumeSharerService,
  TraefikService,
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
    protected readonly volumes: VolumeSharerService,
    protected readonly app: SwarmApp,
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
