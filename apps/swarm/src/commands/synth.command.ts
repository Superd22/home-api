import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Command, CommandRunner, Option } from 'nest-commander';
import { VolumeSharerService } from '../compose/internal/network-volume/volume-sharer.service';
import { composes } from '../swarm.module';
import { SwarmApp } from '../swarm.service';

export interface SynthOptions {
  path?: string;
}

@Command({ name: 'synth', description: 'Creates swarm yml files' })
export class SynthCommand implements CommandRunner {
  private readonly logger = new Logger();
  constructor(
    protected readonly app: SwarmApp,
    protected readonly moduleRef: ModuleRef,
    protected readonly volumes: VolumeSharerService
  ) {}

  async run(passedParam: string[], options?: SynthOptions): Promise<void> {

    const targetedCompose = passedParam.length > 0 ? composes.filter(c => passedParam.includes(c.name.toLowerCase())) : composes

    for (const Chart of targetedCompose) {
      // Getting them only to instanciate them
      const chart = this.moduleRef.get(Chart);
      this.logger.debug(`Found chart ${Chart.name}`);
    }

    this.volumes.synth()

    this.logger.log('Synthing.');
    await this.app.synth({ ...options });
    this.logger.log('Done!');
  }

  @Option({
    flags: '-p, --path [string]',
    description: 'Where to output YMLs',
  })
  protected parsePath(val: string): string {
    return val;
  }
}
