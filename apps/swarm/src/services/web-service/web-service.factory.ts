import { Compose, KeyValue, Network, Service } from '@homeapi/ctsdk';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import set from 'lodash/set';
import { keyValueFromConfig } from '../../charts/utils/kv-from-config.util';
import { WebProxyNetwork } from '../../compose/traefik/webproxy.network';
import { WebService, WebServiceProps } from './webservice.chart';

@Injectable()
export class WebServiceFactory {
  constructor(
    @Inject(WebProxyNetwork)
    protected readonly network: WebProxyNetwork
  ) { }

  public webService(
    compose: Compose,
    name: string,
    props: WebServiceProps,
  ): WebService {
    const service = new WebService(compose, name, {
      ...props,
    });
    this.ensureWebProxyNetwork(compose, service);

    return service;
  }

  /**
   * Adds reverse proxy web access to a service
   * @param service
   * @param web
   */
  public webAccess(service: Service, web: WebAccessProps) {
    const compose = service.scope;

    const { props } = new WebService(undefined, web.routerName, {
      web
    })
    this.ensureWebProxyNetwork(compose, service);

    service.props.labels = [...new Set([...props.labels || [], ...service.props.labels || []]) as any]
    service.props.deploy.labels = [...new Set([...(props.deploy?.labels as any) || [], ...(service.props.deploy?.labels as any) || []]) as any]
    // this.addLabels(service, web)
  }



  protected addLabels(service: Service, config: WebAccessProps): void {
    const labels = {
      traefik: {
        http: {
          services: {
            [config.routerName]: {
              loadbalancer: { server: { port: config.port || 80 } },
            }
          },
          routers: {
            [`${config.routerName}unsecure`]: {
              entrypoints: 'web',
              rule: config.match,
              service: config.routerName
            },
            [config.routerName]: {
              entrypoints: 'websecure',
              rule: config.match,
              service: config.routerName,
              tls: {
                certresolver: 'le',
              },
            },
          },
        },
      },
    }

    if (!config.allowHttp && !config.unsecure) {
      delete labels.traefik.http.routers[`${config.routerName}unsecure`]
    }

    if (config.unsecure) {
      delete labels.traefik.http.routers[config.routerName]
    }

    // find a better way to do dis
    // in swarm mode labels should be on service (ie= deploy) NOT on container
    if (!service.props?.deploy?.labels) set(service.props, 'deploy.labels', []);
    if (!service.props?.labels) set(service.props, 'labels', []);


    service.props.labels.push(...keyValueFromConfig(labels));
    (service.props.deploy.labels as any as KeyValue[]).push(...keyValueFromConfig(labels))

    service.props.labels = [...new Set(service.props.labels as any)] as any
    service.props.deploy.labels = [... new Set(service.props.deploy.labels as any as KeyValue[])] as any
  }

  /**
   * Makes sure given compose has access to webproxy network
   */
  public ensureWebProxyNetwork(...constructs: (Compose | Service)[]): void {
    for (const construct of constructs) {
      if (construct instanceof Compose) {
        // @todo dedup should probably be handled internally
        if (!construct.internals.find((i) => i.id() === this.network.id())) {
          construct.addConstruct(
            new Network(construct, this.network.id(construct), {
              external: { name: this.network.id(construct) },
            }),
          );
        }
      }

      if (construct instanceof Service) {
        if (!construct.props?.networks?.[this.network.id()]) {
          construct.props.networks = {
            ...(construct.props?.networks || {}),
            [this.network.id(construct)]: {},
          };
        }
      }
    }
  }
}

export type WebAccessProps = WebServiceProps['web'] & { routerName: string }