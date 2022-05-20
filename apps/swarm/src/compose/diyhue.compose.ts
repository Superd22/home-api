import { App, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { WebService } from '../services/web-service/webservice.chart';
import { SwarmApp } from '../swarm.service';
@Injectable()
export class DIYHue extends Compose {
  constructor(app: SwarmApp) {
    super(app, DIYHue.name);

    new Network(this, '10_vlan', {
      driver: 'macvlan',
      driver_opts: {
        parent: 'enp0s3'
      },
      ipam: {
        config: [
          { subnet: "192.168.1.0/24", gateway: "192.168.1.1", ip_range: "192.168.1.64/32" }
        ]
      }
    })

    /** @todo in webserver */
    new Network(this, 'webproxy', {
      name: 'webproxy'
    })

    new Volume(this, 'diyhuevolume', null)

    new WebService(this, 'diyhue', {
      web: { match: 'Host(`diyhue.home.davidfain.com`)', allowHttp: true },
      serviceProps: {
        image: 'diyhue/core:latest',
        ports: [
          { target: 1900, published: 1900, protocol: 'udp' },
          { target: 1982, published: 1982, protocol: 'udp' },
          { target: 2100, published: 2100, protocol: 'udp' },
          '2333:4354',
        ],
        volumes: ['diyhuevolume:/opt/hue-emulator/config'],
        environment: [
          'MAC=AA:A4:DD:CB:0D:C9',
          'IP=192.168.1.48',
          { key: 'DEBUG', value: true },
        ],
        mac_address: '02:42:C0:A8:84:64',
        networks: {
          '10_vlan': { priority: 100 },
          webproxy: null,
        },
      },
    });
  }
}
