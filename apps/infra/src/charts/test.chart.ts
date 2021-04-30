import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { KubeDeployment, KubeService, IntOrString } from '@homeapi/k8s';
import { IngressRoute } from '../objects/ingress.object';


export class WhoAmI extends Chart {
  constructor(scope: Construct) {
    super(scope, 'whoami');

    const label = { app: 'whoami' };

    new KubeService(this, 'whoami-service', {
      metadata: {name: 'whoami'},
      spec: {
        ports: [{ protocol: 'TCP', name: 'web', port: 80 }],
        selector: { app: 'whoami' }
      }
    })

    new KubeDeployment(this, 'whoami-deploy', {
      spec: {
        replicas: 1,
        selector: {
          matchLabels: label
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'whoami',
                image: 'traefik/whoami',
                ports: [{ name: 'web', containerPort: 80 }]
              }
            ]
          }
        }
      }
    });


    new IngressRoute(this, 'whoami-rule', {
      name: 'whoamirule',
      entryPoints: ['web'],
      routes: [
        {
          kind: 'Rule',
          match: 'PathPrefix(`/whoami`)',
          services: [{ name: 'whoami', port: 80 }]
        }
      ]
    })
  }
}