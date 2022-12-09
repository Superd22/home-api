import { Compose } from './compose.construct';
import { Construct, Construct_ID } from '../../sdk';
import { DefinitionsNetwork, DefinitionsService } from '../compose-v3';

export class Network extends Construct<NetworkProps, Compose> {

  /**
   * Attaches this network to the given scope
   */
  public bind(scope: Compose) {
    if ((scope as any as Network).internals.find(i => i === this)) return
    else {
      new Network(scope, this.id(scope), {
         external: { name: this.id(scope) },
      })
    }
  }

  public toService(): DefinitionsService['networks'] {
    return {
      [this.id(this.scope)]: {}
    }
  }

}

interface NetworkProps extends DefinitionsNetwork {}
