import {
  App,
  Compose,
  Network,
  Node,
  Port,
  Service,
  Volume,
} from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { WebService } from '../services/web-service/webservice.chart';
import { SwarmApp } from '../swarm.service';
import { LaunchThroughComposeService } from './internal/dind/dind.service';
@Injectable()
export class DIYHue extends Compose {
  constructor(app: SwarmApp, protected web: WebServiceFactory) {
    super(app, DIYHue.name, { name: null, version: '3.8' });

    const volume = new Volume(this, 'config');
    const service = this.web.webService(undefined, 'diyhue', {
      web: { match: 'Host(`hue.davidfain.com`)', allowHttp: true, port: 80 },
      serviceProps: {
        image: 'diyhue/core:latest',
        // no use since macvlan
        // ports: [
        //   // { target: 1900, published: 1900, protocol: 'udp', mode: 'host' },
        //   // { target: 1982, published: 1982, protocol: 'udp', mode: 'host' },
        //   // { target: 2100, published: 2100, protocol: 'udp', mode: 'host' },
        // ],
        volumes: [`${volume.id()}:/opt/hue-emulator/config`],
        environment: [
          'MAC=FE:47:AD:42:F0:D9',
          'IP=192.168.1.64',
          { key: 'DEBUG', value: true },
        ],
        mac_address: '02:42:C0:A8:84:64',
        networks: {
          '10_vlan': {},
        },
      },
    });

    const launcher = new LaunchThroughComposeService(
      this,
      'diyhue',
      { ...service.props },
      { volumes: [`${volume.id(this)}:/opt/hue-emulator/config`] },
      (compose) => {
        new Network(compose, '10_vlan', {
          driver: 'macvlan',
          driver_opts: {
            parent: 'enp0s3',
          },
          ipam: {
            config: [
              {
                subnet: '192.168.1.0/24',
                gateway: '192.168.1.254',
                ip_range: '192.168.1.64/32',
              },
            ],
          },
        });
        this.web.ensureWebProxyNetwork(compose);
        compose.addConstruct(
          new Volume(compose, volume.id(compose), {
            external: { name: volume.id(compose) },
          }),
        );
      },
    );

    new NodeSelector(launcher, AvailableNodes.HomeAPI);
  }
}
