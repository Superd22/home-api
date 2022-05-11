import { App } from '@homeapi/ctsdk';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DataDog } from './compose/datadog.compose';
import { DIYHue } from './compose/diyhue.compose';
import { Config } from './config.encrypted';
import { SwarmApp } from './swarm.service';

const composes = [DIYHue, DataDog];

@Module({
  imports: [],
  controllers: [],
  providers: [Config, SwarmApp, ...composes],
})
export class SwarmModule implements OnModuleInit {
  private readonly logger = new Logger(SwarmModule.name);

  constructor(
    protected readonly app: SwarmApp,
    protected readonly moduleRef: ModuleRef,
  ) {}

  public onModuleInit() {
    for (const Chart of composes) {
      // Getting them only to instanciate them
      const chart = this.moduleRef.get(Chart);
      this.logger.debug(`Activated chart ${Chart.name}`);
    }

    this.logger.log('Synthing.');
    this.app.synth();
    this.logger.log('Done!');
  }
}
