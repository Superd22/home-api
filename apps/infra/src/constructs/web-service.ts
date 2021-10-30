import { Construct } from 'constructs';
import { Names } from 'cdk8s';
import { KubeDeployment, KubeService } from '@homeapi/k8s';
import { IngressRoute } from '../objects/ingress.object';

export interface WebServiceProps {
  /**
   * The Docker image to use for this service.
   */
  readonly image: string;

  /**
   * Number of replicas.
   *
   * @default 1
   */
  readonly replicas?: number;

  /**
   * External port.
   *
   * @default 80
   */
  readonly port?: number;

  /**
   * Traefik match string 
   */
  readonly match: string
}

export class WebService extends Construct {
  constructor(scope: Construct, id: string, props: WebServiceProps) {
    super(scope, id);

    const port = props.port || 80;
    const containerPort = port
    const label = { app: Names.toDnsLabel(this) }; 
    const replicas = props.replicas ?? 1;

    const service = new KubeService(this, 'service', {
      spec: {
        ports: [{ protocol: 'TCP', name: 'web', port }],
        selector: label
      }
    });

    const deployment = new KubeDeployment(this, 'deployment', {
      spec: {
        replicas,
        selector: {
          matchLabels: label
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'app',
                image: props.image,
                ports: [ { containerPort } ]
              }
            ]
          }
        }
      }
    })

    new IngressRoute(this, 'whoami-rule', {
      name: label.app,
      entryPoints: ['websecure'],
      tls: {
        certResolver: 'myresolver'
      },
      routes: [
        {
          kind: 'Rule',
          match: props.match,
          services: [{ name: service.name, port }]
        }
      ]
    })

  }
}