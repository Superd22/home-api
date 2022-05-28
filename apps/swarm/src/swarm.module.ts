import { Module } from '@nestjs/common';
import { CommandYamlHelper } from './commands/command-yaml.service';
import { DeployCommand } from './commands/deploy.command';
import { PruneCommand } from './commands/prune.command';
import { SynthCommand } from './commands/synth.command';
import { Calibre } from './compose/calibre.compose';
import { DataDog } from './compose/datadog.compose';
import { DIYHue } from './compose/diyhue.compose';
import { Flood } from './compose/flood.compose';
import { HomeAssistant } from './compose/home-assistant.compose';
import { VolumeSharerService } from './compose/internal/network-volume/volume-sharer.service';
import { MQTT } from './compose/mqtt.compose';
import { Plex } from './compose/plex/plex.compose';
import { Portainer } from './compose/portainer.compose';
import { Test } from './compose/test.compose';
import { Traefik } from './compose/traefik/traefik.compose';
import { WebProxyNetwork } from './compose/traefik/webproxy.network';
import { Config } from './config.encrypted';
import { WebServiceFactory } from './services/web-service/web-service.factory';
import { SwarmApp } from './swarm.service';

export const composes = [
  Traefik,
  DataDog,
  HomeAssistant,
  Flood,
  Plex,
  Test,
  MQTT,
  Portainer,
  Calibre,
];

const commands = [SynthCommand, DeployCommand, PruneCommand];

@Module({
  imports: [],
  controllers: [],
  providers: [
    Config,
    SwarmApp,
    VolumeSharerService,
    WebProxyNetwork,
    WebServiceFactory,
    CommandYamlHelper,
    ...composes,
    ...commands,
  ],
})
export class SwarmModule {
  constructor(
    protected readonly app: SwarmApp,
    protected readonly volumes: VolumeSharerService,
  ) {}
}