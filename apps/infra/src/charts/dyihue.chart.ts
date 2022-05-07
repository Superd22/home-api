import { Chart, Names } from 'cdk8s';
import { WebService } from '../constructs/web-service';
import { KubePersistentVolumeClaim, Quantity, KubeService, ServicePort, KubeDeployment } from '@homeapi/k8s';
import { CDK8SApp } from '../app.service';
import { Injectable } from '@nestjs/common';
import { IngressPort, IngressService } from '../services/ingress.service';
import { IngressRoute } from '../objects/ingress.object';
import { IngressRouteUDP } from '../objects/ingress-udp.object';

@Injectable()
export class DIYHue extends Chart {
  constructor(
    protected readonly app: CDK8SApp,
    protected readonly ingress: IngressService
    ) {
    super(app, 'diyhue');

    const label = { app: Names.toDnsLabel(this) };

    const ports: ServicePort[] = [
      { name: 'web', port: 80 },
      { name: 'websecure', port: 443 },
      { name: 'hue-1', port: 1900, targetPort: 1900, protocol: 'UDP' },
      { name: 'hue-2', port: 2100, targetPort: 2100, protocol: 'UDP' },
      { name: 'hue-3', port: 1982, targetPort: 1982, protocol: 'UDP' },
    ];

    const volumeClaim = new KubePersistentVolumeClaim(this, 'volume', {
      metadata: {
        name: 'diyhue-config',
      },
      spec: {
        accessModes: ['ReadWriteOnce'],
        storageClassName: 'local-path',
        resources: { requests: { storage: Quantity.fromString('25Mi') } },
      },
    });

    const service = new KubeService(this, 'service', {
      metadata: {
       name: 'diyhue-service'
      },
      spec: {
        ports,
        selector: label,
      },
    });

    const deployment = new KubeDeployment(this, 'deployment', {
      metadata: {
        labels: label,
      },
      spec: {
        replicas: 1,
        strategy: { type: 'Recreate' },
        selector: {
          matchLabels: label,
        },
        template: {
          metadata: { labels: label },
          spec: {
            volumes: [
              {
                name: 'config',
                persistentVolumeClaim: { claimName: volumeClaim.name },
              },
            ],
            nodeSelector: {
              'always-on': 'true',
            },
            containers: [
              {
                imagePullPolicy: 'Always',
                name: 'diyhue',
                volumeMounts: [{ name: 'config', mountPath: '/opt/hue-emulator/export' }],
                image: 'diyhue/core:latest',
                env: [
                  { name: 'MAC', value: 'AA:A4:DD:CB:0D:C9' },
                  { name: 'IP', value: '192.168.1.48' },
                  { name: 'DEBUG', value: 'true' }
                ],
                ports: ports.map(p => ({ name: p.name, protocol: p.protocol, containerPort: p.port }))
              },
            ],
          },
        },
      },
    });

    new IngressRoute(this, 'web-rule', {
      name: 'hue-webrule',
      entryPoints: ['web'],
      routes: [
        {
          kind: 'Rule',
          match: 'Host(`hue.home.davidfain.com`)',
          services: [{ name: service.name, port: 80 }]
        }
      ]
    })

    new IngressRoute(this, 'websecure-rule', {
      name: 'hue-websecurerule',
      entryPoints: ['websecure'],
      tls: {
        certResolver: 'myresolver',
      },
      routes: [
        {
          kind: 'Rule',
          match: 'Host(`hue.home.davidfain.com`)',
          services: [{ name: service.name, port: 80 }]
        }
      ]
    })
    
    for (const port of ports.filter(port => port.protocol === 'UDP')) {
      this.ingress.addIngress({ name: port.name, hostPort: port.port, protocol: port.protocol as 'UDP', })
      new IngressRouteUDP(this, `ingress-rule-${port.name}`, {
        entryPoints: [port.name],
        routes: [
          {
            services: [ { name: service.name , port: port.port } ]
          },
        ],
      });
    }

  }
}
