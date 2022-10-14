import { Compose, Service } from '@homeapi/ctsdk';
import { Injectable, Logger } from '@nestjs/common';
import { SwarmApp } from '../../../swarm.service';
import { WebProxyNetwork } from '../../traefik/webproxy.network';

@Injectable()
export class DevicerService {
  protected readonly logger = new Logger(DevicerService.name);

  public constructor(
    protected readonly app: SwarmApp,
    protected readonly network: WebProxyNetwork,
  ) {

  }

  /**
   * Creates all the infrastructure required to mount device in swarm services.
   * Should be called AFTER every other compose have been synthed
   */
  public synth(): Compose {
    this.logger.debug(`Synthing devicer service`);

    const compose = new Compose(this.app, 'devicer', {
      version: '3.8',
      name: null,
    });

    const service = new Service(
      compose,
      `devicer`,
      {
        image: 'docker:dind',
        command: [
          'ash',
          '-c',
          `term_signal_handler() {echo "############  Caught SIGTERM #############";docker stop devices_volume_priv >/dev/null 2>&1;exit;} trap 'term_signal_handler' SIGTERM; echo "Starting event listener container"; docker run --rm --privileged --tty=false -i --name devices_volume_priv -v /var/run/docker.sock:/var/run/docker.sock -v /sys/fs/cgroup/devices/docker/:/docker/:Z -v /dev/:/real/dev/ docker sh -s <<"EOF" & add_perm() {read DEVICE CID;if [[ -z $$DEVICE ]]; then echo "we did a startup I think"; return; fi; USBDEV=\`readlink -f /real$\${DEVICE}\`; major=\`stat -c '%t' $$USBDEV\`; minor=\`stat -c '%T' $$USBDEV\`; if [[ -z $$minor || -z $$major ]]; then echo 'Device not found'; return; fi; dminor=$$((0x$\${minor})); dmajor=$$((0x$\${major})); echo "Setting permissions (c $$dmajor:$$dminor rwm) for $\${CID} to device ($\${DEVICE})"; echo "c $$dmajor:$$dminor rwm" > /docker/$\${CID}/devices.allow;} echo "Listening for startup events that have a label of 'volume.device'"; while true; do docker events --filter 'label=volume.device' --filter 'event=start' --format '{{index .Actor.Attributes "volume.device"}} {{.Actor.ID}}' | add_perm; echo "Restarting events listener"; done; EOF while true ; do sleep 5; done`
        ],
        volumes: [
          '/var/run/docker.sock:/var/run/docker.sock'
        ],
        deploy: {
          mode: 'global',
        }
      },
    )

    return compose
  }
}
