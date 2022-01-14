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

export class Traefik extends Chart {
  constructor(scope: Construct) {
    super(scope, 'traefik-chart', {});
    this.doCRDs();

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
          { protocol: 'TCP', name: 'web', port: 80 },
          { protocol: 'TCP', name: 'admin', port: 8080 },
          { protocol: 'TCP', name: 'websecure', port: 443 },
        //   { protocol: 'UDP', name: 'sat-main', port: 7777 },
        //   { protocol: 'UDP', name: 'sat-beacon', port: 15000 },
        //   { protocol: 'UDP', name: 'sat-query', port: 15777 },
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
                  '--accesslog',
                  '--log.level=DEBUG',
                  '--entrypoints.web.Address=:80',
                  '--entrypoints.websecure.Address=:443',
                //   '--entrypoints.sat-main.Address=:7777/udp',
                //   '--entrypoints.sat-beacon.Address=:15000/udp',
                //   '--entrypoints.sat-query.Address=:15777/udp',
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
                  {
                    name: 'web',
                    containerPort: 80,
                    hostPort: 80,
                  },
                  {
                    name: 'websecure',
                    containerPort: 443,
                    hostPort: 443,
                  },
                  {
                    name: 'admin',
                    containerPort: 8080,
                    hostPort: 8080,
                  },
                //   {
                //     protocol: 'UDP',
                //     name: 'sat-main',
                //     containerPort: 7777,
                //     hostPort: 7777,
                //   },
                //   {
                //     protocol: 'UDP',
                //     name: 'sat-beacon',
                //     containerPort: 15000,
                //     hostPort: 15000,
                //   },
                //   {
                //     protocol: 'UDP',
                //     name: 'sat-query',
                //     containerPort: 15777,
                //     hostPort: 15777,
                //   },
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
