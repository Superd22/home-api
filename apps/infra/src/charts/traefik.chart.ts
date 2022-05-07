import { Construct } from 'constructs';
import { App, Chart, JsonPatch } from 'cdk8s';
import { ServiceAccount } from 'cdk8s-plus-17';
import {
  KubeDeployment,
  KubeService,
  KubeClusterRole,
  KubeClusterRoleBinding,
} from '@homeapi/k8s';
import { KubeCustomResourceDefinition } from 'cdk8s-plus-17/lib/imports/k8s';
import { IngressRoute } from '../objects/ingress.object';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { CDK8SApp } from '../app.service';
import { IngressService } from '../services/ingress.service';

@Injectable()
export class Traefik extends Chart {
  constructor(
    protected readonly app: CDK8SApp,
    protected readonly ingress: IngressService
  ) {
    super(app, 'traefik-chart', {});
    // this.doCRDs();

    new KubeClusterRole(this, 'traefik-cluster-role', {
      metadata: {
        name: 'traefik-ingress-controller',
      },
      rules: [
        {
          apiGroups: [''],
          verbs: ['get', 'list', 'watch'],
          resources: ['services', 'endpoints', 'secrets'],
        },
        {
          apiGroups: ['extensions', 'networking.k8s.io'],
          verbs: ['get', 'list', 'watch'],
          resources: ['ingresses', 'ingressclasses'],
        },
        {
          apiGroups: ['extensions'],
          verbs: ['update'],
          resources: ['ingresses/status'],
        },
        {
          apiGroups: ['traefik.containo.us'],
          resources: [
            'middlewares',
            'ingressroutes',
            'traefikservices',
            'ingressroutetcps',
            'ingressrouteudps',
            'tlsoptions',
            'tlsstores',
            'serverstransports',
          ],
          verbs: ['get', 'list', 'watch'],
        },
      ],
    });

    new KubeClusterRoleBinding(this, 'traefik-clusterrolebinding', {
      metadata: {
        name: 'traefik-ingress-controller',
      },
      roleRef: {
        kind: 'ClusterRole',
        name: 'traefik-ingress-controller',
        apiGroup: 'rbac.authorization.k8s.io',
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          name: 'traefik-ingress-controller',
          namespace: 'default',
        },
      ],
    });

    new KubeService(this, 'traefik-service', {
      metadata: {
        name: 'traefik',
      },
      spec: {
        ports: [
          ...this.ingress.ingresses.map(ingress => ({
            protocol: ingress.protocol || 'TCP',
            name: ingress.name,
            port: ingress.hostPort
          })),
        ],
        selector: {
          app: 'traefik',
        },
      },
    });

    new ServiceAccount(this, 'traefik-ingress-controller', {
      metadata: {
        name: 'traefik-ingress-controller',
      },
    });

    const label = { app: 'traefik' };
    new KubeDeployment(this, 'traefik-deployment', {
      metadata: {
        name: 'traefik',
        labels: label,
      },
      spec: {
        strategy: { type: 'Recreate' },
        replicas: 1,
        selector: {
          matchLabels: label,
        },
        template: {
          metadata: { labels: label },
          spec: {
            serviceAccountName: 'traefik-ingress-controller',
            hostNetwork: true,
            nodeSelector: {
              'always-on': 'true',
            },
            containers: [
              {
                name: 'traefik',
                image: 'traefik:v2.4',
                args: [
                  '--api.insecure',
                  '--accesslog=true',
                  '--accesslog.format=json',
                  '--log.format=json',
                  '--log.level=DEBUG',
                  '--log.format=json',
                  ...this.ingress.ingresses.map(ingress => `--entrypoints.${ingress.name}.Address=:${ingress.hostPort}${ingress.protocol === 'UDP' ? '/udp' : ''}`),
                  '--pilot.token=68a9f3b3-5ae6-4546-aa05-59d5bece33c1',
                  '--providers.kubernetescrd',
                  '--certificatesresolvers.myresolver.acme.tlschallenge',
                  '--certificatesresolvers.myresolver.acme.email=superd001@gmail.com',
                  '--certificatesresolvers.myresolver.acme.storage=acme.json',
                  // Please note that this is the staging Let's Encrypt server.
                  // Once you get things working, you should remove that whole line altogether.
                  // '--certificatesresolvers.myresolver.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory',
                ],
                ports: [
                  ...this.ingress.ingresses.map((ingress) => ({
                    name: ingress.name,
                    containerPort: ingress.hostPort,
                    hostPort: ingress.hostPort,
                    protocol: ingress.protocol
                  })),
                ],
              },
            ],
          },
        },
      },
    });

    new IngressRoute(this, 'traefik-dashboard', {
      name: 'dashboard',
      entryPoints: ['web'],
      routes: [
        {
          kind: 'Rule',
          match: 'PathPrefix(`/dashboard`)',
          services: [{ name: 'api@internal', kind: 'TraefikService' }],
        },
      ],
    });
  }

  /**
   * Declare CustomRessourceDefinitions needed by traefik
   */
  protected doCRDs() {
    new KubeCustomResourceDefinition(
      this,
      'ingressroutes.traefik.containo.us',
      {
        metadata: { name: 'ingressroutes.traefik.containo.us' },
        spec: {
          group: 'traefik.containo.us',
          version: 'v1alpha1',
          names: {
            kind: 'IngressRoute',
            plural: 'ingressroutes',
            singular: 'ingressroute',
          },
          scope: 'Namespaced',
        },
      },
    ).addJsonPatch(
      JsonPatch.replace('/apiVersion', 'apiextensions.k8s.io/v1beta1'),
    );

    new KubeCustomResourceDefinition(this, 'middlewares.traefik.containo.us', {
      metadata: { name: 'middlewares.traefik.containo.us' },
      spec: {
        group: 'traefik.containo.us',
        version: 'v1alpha1',
        names: {
          kind: 'Middleware',
          plural: 'middlewares',
          singular: 'middleware',
        },
        scope: 'Namespaced',
      },
    }).addJsonPatch(
      JsonPatch.replace('/apiVersion', 'apiextensions.k8s.io/v1beta1'),
    );

    new KubeCustomResourceDefinition(
      this,
      'ingressroutetcps.traefik.containo.us',
      {
        metadata: { name: 'ingressroutetcps.traefik.containo.us' },
        spec: {
          group: 'traefik.containo.us',
          version: 'v1alpha1',
          names: {
            kind: 'IngressRouteTCP',
            plural: 'ingressroutetcps',
            singular: 'ingressroutetcp',
          },
          scope: 'Namespaced',
        },
      },
    ).addJsonPatch(
      JsonPatch.replace('/apiVersion', 'apiextensions.k8s.io/v1beta1'),
    );

    new KubeCustomResourceDefinition(
      this,
      'ingressrouteudps.traefik.containo.us',
      {
        metadata: { name: 'ingressrouteudps.traefik.containo.us' },
        spec: {
          group: 'traefik.containo.us',
          version: 'v1alpha1',
          names: {
            kind: 'IngressRouteUDP',
            plural: 'ingressrouteudps',
            singular: 'ingressrouteudp',
          },
          scope: 'Namespaced',
        },
      },
    ).addJsonPatch(
      JsonPatch.replace('/apiVersion', 'apiextensions.k8s.io/v1beta1'),
    );

    new KubeCustomResourceDefinition(this, 'tlsoptions.traefik.containo.us', {
      metadata: { name: 'tlsoptions.traefik.containo.us' },
      spec: {
        group: 'traefik.containo.us',
        version: 'v1alpha1',
        names: {
          kind: 'TLSOption',
          plural: 'tlsoptions',
          singular: 'tlsoption',
        },
        scope: 'Namespaced',
      },
    }).addJsonPatch(
      JsonPatch.replace('/apiVersion', 'apiextensions.k8s.io/v1beta1'),
    );

    new KubeCustomResourceDefinition(this, 'tlsstores.traefik.containo.us', {
      metadata: { name: 'tlsstores.traefik.containo.us' },
      spec: {
        group: 'traefik.containo.us',
        version: 'v1alpha1',
        names: { kind: 'TLSStore', plural: 'tlsstores', singular: 'tlsstore' },
        scope: 'Namespaced',
      },
    }).addJsonPatch(
      JsonPatch.replace('/apiVersion', 'apiextensions.k8s.io/v1beta1'),
    );

    new KubeCustomResourceDefinition(
      this,
      'traefikservices.traefik.containo.us',
      {
        metadata: { name: 'traefikservices.traefik.containo.us' },
        spec: {
          group: 'traefik.containo.us',
          version: 'v1alpha1',
          names: {
            kind: 'TraefikService',
            plural: 'traefikservices',
            singular: 'traefikservice',
          },
          scope: 'Namespaced',
        },
      },
    ).addJsonPatch(
      JsonPatch.replace('/apiVersion', 'apiextensions.k8s.io/v1beta1'),
    );

    new KubeCustomResourceDefinition(
      this,
      'serverstransports.traefik.containo.us',
      {
        metadata: { name: 'serverstransports.traefik.containo.us' },
        spec: {
          group: 'traefik.containo.us',
          version: 'v1alpha1',
          names: {
            kind: 'ServersTransport',
            plural: 'serverstransports',
            singular: 'serverstransport',
          },
          scope: 'Namespaced',
        },
      },
    ).addJsonPatch(
      JsonPatch.replace('/apiVersion', 'apiextensions.k8s.io/v1beta1'),
    );
  }

}
