import { Construct } from 'constructs';
import { Chart, Names } from 'cdk8s';
import { WebService } from '../constructs/web-service';
import {
  KubeDeployment,
  KubePersistentVolumeClaim,
  KubeService,
  Quantity,
  ServicePort,
} from '@homeapi/k8s';
import { IngressRouteUDP } from '../objects/ingress-udp.object';

export class Satisfactory extends Chart {
  constructor(scope: Construct) {
    super(scope, 'satisfactory');

    const label = { app: Names.toDnsLabel(this) };

    const volumeClaim = new KubePersistentVolumeClaim(this, 'volume', {
      metadata: {
        name: 'satisfactory-volume',
      },
      spec: {
        accessModes: ['ReadWriteOnce'],
        storageClassName: 'local-path',
        resources: { requests: { storage: Quantity.fromString('15Gi') } },
      },
    });

  const ports: ServicePort[] = [
    { protocol: 'UDP', name: 'sat-main', port: 7777 },
    { protocol: 'UDP', name: 'sat-beacon', port: 15000 },
    { protocol: 'UDP', name: 'sat-query', port: 15777,  },
    ]

    const service = new KubeService(this, 'service', {
      metadata: {
       name: 'satisfactory-service'
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
              powerful: 'true',
            },
            containers: [
              {
                name: 'satisfactory',
                volumeMounts: [{ name: 'config', mountPath: '/config' }],
                image: 'wolveix/satisfactory-server:latest',
                env: [
                  { name: 'DEBUG', value: 'false' },
                  { name: 'MAXPLAYERS', value: '8' },
                  { name: 'PGID', value: '1000' },
                  { name: 'PUID', value: '1000' },
                  { name: 'SKIPUPDATE', value: 'false' },
                  { name: 'STEAMBETA', value: 'true' },
                ],
                ports: ports.map(p => ({ protocol: 'UDP', hostPort: p.port, containerPort: p.port }))
              },
            ],
          },
        },
      },
    });


      // new IngressRouteUDP(this, `ingress-rule`, {
      //   routes: [
      //     {
      //       services: 
      //         ports.map(p => ({
      //           name: service.name,
      //           port: p.port
      //         }))
      //     },
      //   ],
      // });

    
  }
}
