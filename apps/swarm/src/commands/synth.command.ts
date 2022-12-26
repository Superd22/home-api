import { Compose } from '@homeapi/ctsdk';
import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { cp } from 'fs/promises';
import { Command, CommandRunner, Option } from 'nest-commander';
import { MetadataExplorerService } from '../services/metadatas/metadata-explorer.service';
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
    protected readonly metadatas: MetadataExplorerService,
  ) { }

  async run(passedParam: string[], options?: SynthOptions): Promise<void> {

    const targetedCompose = passedParam.length > 0 ? composes.filter(c => passedParam.includes(c.name.toLowerCase())) : composes

    for (const Chart of targetedCompose) {
      // Getting them only to instanciate them
      const chart = this.moduleRef.get(Chart);
      this.logger.debug(`Found chart ${Chart.name}`);
    }

    for (const after of this.metadatas.synthAfterCompose()) {
      if (!(after instanceof Compose)) after.synth()
    }

    this.logger.log('Synthing.');
    await this.app.synth({ ...options });
    await cp(__dirname + '/../../../apps/swarm/manual', options.path || './', { recursive: true })

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
