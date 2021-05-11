import { CustomResourceDefinitionNames,  } from '../../../../libs/k8s/src/imports/k8s';
import { Construct } from 'constructs';
import { App, Chart, ChartProps,  } from 'cdk8s';
import { IngressV1Beta1 } from 'cdk8s-plus-17'
import { KubeDeployment, KubeService, IntOrString, KubeClusterRole, KubeClusterRoleBinding,  } from '@homeapi/k8s';
import { KubeCustomResourceDefinition } from 'cdk8s-plus-17/lib/imports/k8s';


export class Traefik extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new KubeCustomResourceDefinition(this, 'ingressroutes.traefik.containo.us', {
        spec: {
            group: 'traefik.containo.us',
            version: 'v1alpha1',
            names: {kind: 'IngressRoute', plural: 'ingressroutes', singular: 'ingressroute'},
            scope: 'Namespaced'
        }
    })


    new KubeCustomResourceDefinition(this, 'middlewares.traefik.containo.us', {
        spec: {
            group: 'traefik.containo.us',
            version: 'v1alpha1',
            names: {kind: 'Middleware', plural: 'middlewares', singular: 'middleware'},
            scope: 'Namespaced'
        }
    })


    new KubeCustomResourceDefinition(this, 'ingressroutetcps.traefik.containo.us', {
        spec: {
            group: 'traefik.containo.us',
            version: 'v1alpha1',
            names: {kind: 'IngressRouteTCP', plural: 'ingressroutetcps', singular: 'ingressroutetcp'},
            scope: 'Namespaced'
        }
    })

    new KubeCustomResourceDefinition(this, 'ingressroutetudps.traefik.containo.us', {
        spec: {
            group: 'traefik.containo.us',
            version: 'v1alpha1',
            names: {kind: 'IngressRouteUDP', plural: 'ingressrouteudps', singular: 'ingressrouteudp'},
            scope: 'Namespaced'
        }
    })

    new KubeCustomResourceDefinition(this, 'tlsoptions.traefik.containo.us', {
        spec: {
            group: 'traefik.containo.us',
            version: 'v1alpha1',
            names: {kind: 'TLSOption', plural: 'tlsoptions', singular: 'tlsoption'},
            scope: 'Namespaced'
        }
    })

    new KubeCustomResourceDefinition(this, 'tlsstores.traefik.containo.us', {
        spec: {
            group: 'traefik.containo.us',
            version: 'v1alpha1',
            names: {kind: 'TLSStore', plural: 'tlsstores', singular: 'tlsstore'},
            scope: 'Namespaced'
        }
    })


    new KubeCustomResourceDefinition(this, 'traefikservices.traefik.containo.us', {
        spec: {
            group: 'traefik.containo.us',
            version: 'v1alpha1',
            names: {kind: 'TraefikService', plural: 'traefikservices', singular: 'traefikservice'},
            scope: 'Namespaced'
        }
    })


    new KubeCustomResourceDefinition(this, 'serverstransports.traefik.containo.us', {
        spec: {
            group: 'traefik.containo.us',
            version: 'v1alpha1',
            names: {kind: 'ServersTransport', plural: 'serverstransports', singular: 'serverstransport'},
            scope: 'Namespaced'
        }
    })

    


    new KubeClusterRole(this, 'traefik-ingress-controller', {
        metadata: {

        },
        rules: [
            {
                apiGroups: [""],
                verbs: ["get", "list", "watch"],
                resources: ["services", "endpoint", "secrets"]
            },
            {
                apiGroups: ["extensions", "networking.k8s.io"],
                verbs: ["get","list","watch"],
                resources: ["ingresses", "ingressclasses"]
            },
            {
                apiGroups: ["extensions"],
                verbs: ["update"],
                resources: ["ingresses/status"]
            },
            {
                apiGroups: ["traefik.containo.us"],
                resources: ["middlewares","ingressroutes","traefikservices","ingressroutetcps","ingressrouteudps","tlsoptions","tlsstores","serverstransports"],
                verbs: ["get", "list", "watch"]
            }
        ]
    })

    new KubeClusterRoleBinding(this, "traefik-ingress-controller", {
        roleRef: {
            kind: "ClusterRole",
            name: "traefik-ingress-controller",
            apiGroup: "rbac.authorization.k8s.io"
        },
        subjects: [
            {kind: "ServiceAccount", name: "traefik-ingress-controller",     namespace: "default"        }
        ]
    })

    new KubeDeployment(this, 'deployment', {
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
                name: 'hello-kubernetes',
                image: 'paulbouwer/hello-kubernetes:1.7',
                ports: [ { containerPort: 8080 } ]
              }
            ]
          }
        }
      }
    });
  }
}

const app = new App();
new MyChart(app, 'helloworldtest');
app.synth();