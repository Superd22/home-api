import { Compose } from './compose.construct';
import { Construct } from '../../sdk/';
import { DefinitionsService } from '../compose-v3';
import { Port } from '../nodes/port.node';
import { KeyValue, KeyValueImpl } from '../nodes/key-value.node';
import { Network } from './network.construct';

export class Service extends Construct<ServiceProps, Compose> {
  public toJSON() {
    const props = { ...this._props };

    props.environment = props.environment?.map((e) =>
      typeof e === 'string' ? e : new KeyValueImpl(e),
    );

    props.labels = props.labels?.map((l) =>
      typeof l === 'string' ? l : new KeyValueImpl(l),
    );

    if (props.networks && Array.isArray(props.networks)) {
      props.networks = props.networks.map((network) => {
        if (typeof network === 'string') return network;
        else return (network as Network).toJSON(this) as string;
      });
    }

    return props;
  }
}

// @ts-ignore
export interface ServiceProps extends DefinitionsService {
  ports?: (Port | string)[];
  environment?: (KeyValue | string)[];
  labels?: (KeyValue | string)[];
  networks?: DefinitionsService['networks'];
}
