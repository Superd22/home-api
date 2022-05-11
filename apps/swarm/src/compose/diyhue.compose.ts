import { App, Compose, Port, Service } from '@homeapi/ctsdk';
import { WebService } from '../charts/webservice.chart';

export class DIYHue extends Compose {
  constructor(app: App) {
    super(app, DIYHue.name);

    new WebService(this, 'diyhue', {
      web: { match: 'Host(`diyhue.home.davidfain.com`)' },
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
