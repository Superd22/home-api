import { Compose } from '../docker/constructs/compose.construct';
import { Construct, Construct_ID } from './construct';
import { writeFile } from 'fs/promises';

export class App extends Construct<any> {
  constructor() {
    super(undefined, undefined, undefined);
  }

  public async synth() {
    return Promise.all(
      this.internals
        .filter((i) => i instanceof Compose)
        .map(async (compose) => {
          const data = (compose as Compose).toYAML();

          return writeFile(
            `docker-compose.${compose[Construct_ID]}.yml`,
            data,
            { encoding: 'utf-8' },
          );
        }),
    );
  }
}
