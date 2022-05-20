import { Compose } from './compose.construct';
import { Construct } from '../../sdk/';
import { DefinitionsService } from '../compose-v3';
import { Port } from '../nodes/port.node';
import { KeyValue, KeyValueImpl } from '../nodes/key-value.node';

export class Service extends Construct<ServiceProps, Compose> {
  protected toJSON() {
    const props = { ...this._props };

    props.environment = props.environment?.map((e) =>
      typeof e === 'string' ? e : new KeyValueImpl(e),
    );

    props.labels = props.labels?.map((l) =>
      typeof l === 'string' ? l : new KeyValueImpl(l),
    );


    return props;
  }
}

// @ts-ignore
export interface ServiceProps
  extends DefinitionsService {
  ports?: (Port | string)[];
  environment?: (KeyValue | string)[];
  labels?: (KeyValue | string)[];
}
