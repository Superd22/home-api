import { Construct_ID, KeyValue, Service } from "@homeapi/ctsdk";
import set from "lodash/set";
import { keyValueFromConfig } from "../../charts/utils/kv-from-config.util";

/**
 * 
 * @param service 
 */
export function reverseProxyToWeb(service: Service, options: ReverseProxyOptions) {
    if (!service.props.labels) service.props.labels = [];

    const labels = {
      traefik: {
        port: options.port || 80,
        docker: {network: 'traefik_webproxy' },
        http: {
          services: {
            [service[Construct_ID]]: {
              loadbalancer: { server: { port: options.port || 80 } },
            }
          },
          routers: {
            [`${service [Construct_ID]}unsecure`]: {
              entrypoints: 'web',
              rule: options.match,
              service: service[Construct_ID]
            },
            [service[Construct_ID]]: {
              entrypoints: 'websecure',
              rule: options.match,
              service: service[Construct_ID],
              tls: {
                certresolver: 'le',
              },
            },
          },
        },
      },
    }

    if (!options.allowHttp && !options.unsecure)  {
      delete labels.traefik.http.routers[`${service [Construct_ID]}unsecure`]
    }

    if (options.unsecure) {
      delete labels.traefik.http.routers[service[Construct_ID]]
    }

    service.props.labels.push(...keyValueFromConfig(labels));

    // find a better way to do dis
    // in swarm mode labels should be on service (ie= deploy) NOT on container
    if (!service.props?.deploy?.labels) set(service.props, 'deploy.labels', []);
    (service.props.deploy.labels as any as KeyValue[]).push(...keyValueFromConfig(labels))
}

export interface ReverseProxyOptions {
    /** traefik match string */
    match: string;
    // /** declares a custom router name, defaults to service name */
    // routerName?: string;
    unsecure?: boolean;
    allowHttp?: boolean;
    /** 
     * container port to use
     * default: 80
     */
    port?: number
}