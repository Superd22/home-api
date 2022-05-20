import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CommandYamlHelper } from './commands/command-yaml.service';
import { DeployCommand } from './commands/deploy.command';
import { PruneCommand } from './commands/prune.command';
import { SynthCommand } from './commands/synth.command';
import { DataDog } from './compose/datadog.compose';
import { DIYHue } from './compose/diyhue.compose';
import { HomeAssistant } from './compose/home-assistant.compose';
import { Test } from './compose/test.compose';
import { Traefik } from './compose/traefik/traefik.compose';
import { WebProxyNetwork } from './compose/traefik/webproxy.network';
import { Config } from './config.encrypted';
import { WebServiceFactory } from './services/web-service/web-service.factory';
import { SwarmApp } from './swarm.service';

export const composes = [Traefik, DIYHue, DataDog, HomeAssistant, Test];

const commands = [SynthCommand, DeployCommand, PruneCommand]

@Module({
  imports: [],
  controllers: [],
  providers: [
    Config,
    SwarmApp,
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
  ) {}

}
