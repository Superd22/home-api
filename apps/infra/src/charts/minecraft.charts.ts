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
import { IngressRouteTCP } from '../objects/ingress-tcp.object';

export class Minecraft extends Chart {
  constructor(scope: Construct) {
    super(scope, 'minecraft');

    const label = { app: Names.toDnsLabel(this) };

    const volumeClaim = new KubePersistentVolumeClaim(this, 'volume', {
      metadata: {
        name: 'minecraft-volume',
      },
      spec: {
        accessModes: ['ReadWriteOnce'],
        storageClassName: 'local-path',
        resources: { requests: { storage: Quantity.fromString('15Gi') } },
      },
    });

  const ports: ServicePort[] = [
    { protocol: 'TCP', name: 'minecraft-main', port: 25565 },
  ]

    const service = new KubeService(this, 'service', {
      metadata: {
       name: 'minecraft-service'
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
                name: 'data',
                persistentVolumeClaim: { claimName: volumeClaim.name },
              },
            ],
            nodeSelector: {
              powerful: 'true',
            },
            containers: [
              {
                name: 'minecraft',
                volumeMounts: [{ name: 'data', mountPath: '/data' }],
                image: 'itzg/minecraft-server',
                env: [
                  { name: 'EULA', value: 'true' },
                ],
                ports: ports.map(p => ({ protocol: 'TCP', containerPort: p.port }))
              },
            ],
          },
        },
      },
    });


      new IngressRouteTCP(this, `ingress-rule-tcp`, {
        entryPoints: ['minecraft'],
        routes: [
          {
            services: 
              ports.map(p => ({
                name: service.name,
                port: p.port
              }))
          },
        ],
      });

    
  }
}
