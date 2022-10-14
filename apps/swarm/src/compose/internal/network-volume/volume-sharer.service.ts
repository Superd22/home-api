import { Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { Injectable, Logger } from '@nestjs/common';
import {
  AvailableNodes,
  NodeSelector,
} from 'apps/swarm/src/charts/node-selector';
import { keyValueFromConfig } from 'apps/swarm/src/charts/utils/kv-from-config.util';
import { SynthAfterCompose } from 'apps/swarm/src/services/metadatas/after-compose.decorator';
import { SwarmApp } from '../../../swarm.service';
import { WebProxyNetwork } from '../../traefik/webproxy.network';
import { LaunchThroughComposeService } from '../dind/dind.service';
import { NetworkVolume } from './network.volume';

@SynthAfterCompose()
@Injectable()
export class VolumeSharerService {
  protected readonly logger = new Logger(VolumeSharerService.name);
  protected readonly volumes: NetworkVolume[] = [];

  public static readonly instance: VolumeSharerService;

  public constructor(
    protected readonly app: SwarmApp,
    protected readonly network: WebProxyNetwork,
  ) {
    if (VolumeSharerService.instance) return VolumeSharerService.instance;
    else {
      (VolumeSharerService as any).instance = this;
    }
  }

  public registerVolume(volume: NetworkVolume): void {
    if (this.volumes.find((v) => v.id() === volume.id())) {
      // Already have this volume
      return this.logger.warn(
        `Tried re-registering a volume we already have... ${volume.id()}`,
      );
    }

    this.volumes.push(volume);
  }

  public getNfsOptsFor(node: AvailableNodes): string {
    // @todo for other hosts
    switch (node) {
      case AvailableNodes.Galactica:
        return `addr=192.168.192.69,nolock,rw,soft`;
      case AvailableNodes.HomeAPI:
        return `addr=192.168.192.197,nolock,rw,soft`;

    }
  }

  /**
   * Creates all the infrastructure required to share volumes.
   * Should be called AFTER every other compose have been synthed
   */
  public synth(): Compose {
    this.logger.debug(`Synthing network volumes`);

    const compose = new Compose(this.app, 'network_volumes', {
      version: '3.8',
      name: null,
    });

    const requiredNodes = [...new Set(this.volumes.map((v) => v.node))];

    for (const node of requiredNodes) {
      const volumes = this.volumes.filter((volume) => volume.node === node);
      const rootVolume = new Volume(compose, `root-${node.toLowerCase()}`, null, true)
      const service = new LaunchThroughComposeService(
        compose,
        `sharer_${node}`,
        {
          image: 'zhangyi2018/nfs-server',
          cap_add: ['SYS_ADMIN', 'CAP_NET_ADMIN'],
          volumes: [
            `${rootVolume.id()}:/nfs`,
            ...volumes.map((v, index) => `${v.path}:/nfs/${v.id()}`)],
          networks: {
            /** @todo custom network */
            [this.network.id(compose)]: {},
          },
          ports: [
            ...[111, 2049, 32765, 32767].flatMap((port) =>
              ['tcp', 'udp'].map((type) => `${port}:${port}/${type}`),
            ),
          ],
          security_opt: ['apparmor=erichough-nfs'],
          environment: keyValueFromConfig({
            [`NFS_EXPORT_0`]: `/nfs/ *(fsid=0)`,
            ...volumes.reduce(
              (acc, volume, index) => ({
                ...acc,
                [`NFS_EXPORT_${index + 1}`]: `/nfs/${volume.id()} *(rw,sync,no_root_squash,all_squash,anonuid=1000,anongid=1000)`,
              }),
              {},
            ),
            NFS_LOG_LEVEL: 'DEBUG',
          }),
        },
        {},
        (scope) => {
          this.network.bind(scope);
          (scope as any).addConstruct(rootVolume)

          for (const namedVolume of volumes.filter(v => v.isNamed)) {
            scope.addConstruct(
              new Volume(scope, namedVolume.id(), {
                external: true
              })
            )
          }
        },
      );

      new NodeSelector(service, node);
    }

    return compose;
  }
}
