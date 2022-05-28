import { Compose, Volume } from '@homeapi/ctsdk';
import { AvailableNodes } from '../../../charts/node-selector';
import { VolumeSharerService } from './volume-sharer.service';

/**
 * Creates a network volume that can be accessed by every node in the swarm
 *
 * currently based on NFS
 */
export class NetworkVolume extends Volume {
  protected readonly sharerService: VolumeSharerService =
    VolumeSharerService.instance;

  /**
   * Returns information on which node is actually storing this volume
   */
  public get node(): AvailableNodes {
    return this.options.node;
  }

  public get path(): string {
    return this.options.path;
  }

  constructor(
    scope: Compose,
    name: string,
    protected readonly options: NetworkVolumeOptions,
  ) {
    super(scope, name, {
      driver: 'local',
      driver_opts: {
        type: 'nfs',
        o: VolumeSharerService.instance.getNfsOptsFor(options.node),
      },
    });
    this.sharerService.registerVolume(this);
    this.props.driver_opts.device = `:/nfs/${this.id()}`
  }
}

type NetworkVolumeOptions = NetworkVolumeBoundOptions;

interface NetworkVolumeBoundOptions {
  node: AvailableNodes;
  /** path on node */
  path: string;
}
