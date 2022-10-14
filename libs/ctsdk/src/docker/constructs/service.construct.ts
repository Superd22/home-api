import { Compose } from './compose.construct';
import { Construct } from '../../sdk/';
import { DefinitionsService } from '../compose-v3';
import { Port } from '../nodes/port.node';
import { KeyValue, KeyValueImpl } from '../nodes/key-value.node';
import { Network } from './network.construct';
import { SwarmDevice } from '../nodes/swarm-device.node';

export class Service extends Construct<ServiceProps, Compose> {
  public toJSON() {
    const props = { ...this._props };

    props.environment = props.environment?.map((e) =>
      typeof e === 'string' ? e : new KeyValueImpl(e),
    );

    props.labels = props.labels?.map((l) =>
      typeof l === 'string' ? l : new KeyValueImpl(l),
    );

    const swarmDevices = [];
    props.devices = props.devices?.map((d: string | SwarmDevice) => {
      if (d instanceof SwarmDevice) {
        props.volumes = props.volumes || []
        props.labels = props.labels || []

        props.volumes.push(`${d.props.devicePath}:${d.props.devicePath}`)
        swarmDevices.push(d.props.devicePath)
        return undefined
      }

      return d
    }).filter(d => !!d)

    if (swarmDevices.length) {
      props.labels.push(`volume.device=${swarmDevices.join(';')}`)
    }

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
