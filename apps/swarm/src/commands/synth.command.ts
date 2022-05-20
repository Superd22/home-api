import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Command, CommandRunner, Option } from 'nest-commander';
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
  ) {}

  async run(passedParam: string[], options?: SynthOptions): Promise<void> {
    for (const Chart of composes) {
      // Getting them only to instanciate them
      const chart = this.moduleRef.get(Chart);
      this.logger.debug(`Found chart ${Chart.name}`);
    }

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
