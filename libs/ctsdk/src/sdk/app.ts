import { Compose } from '../docker/constructs/compose.construct';
import { Construct, Construct_ID } from './construct';
import { writeFile, mkdir } from 'fs/promises';
import { Logger } from '@nestjs/common';

export class App extends Construct<any> {
  protected logger = new Logger(App.name);

  constructor() {
    super(undefined, undefined, undefined);
  }

  public async synth(options: SynthOption = {}) {
    if (options.path) {
      this.logger.verbose('Ensuring folder exists for synth');
      await mkdir(options.path, { recursive: true });
    }

    return Promise.all(
      this.internals
        .filter((i) => i instanceof Compose)
        .map(async (compose) => {
          const data = (compose as Compose).toYAML();
          return writeFile(
            `${options.path ? options.path : ''}docker-compose.${
              compose[Construct_ID]
            }.yml`,
            data,
            { encoding: 'utf-8' },
          );
        }),
    );
  }
}

interface SynthOption {
  path?: string;
}
