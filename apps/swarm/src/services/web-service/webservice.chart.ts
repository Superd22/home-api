import { Compose, Construct_ID, KeyValue, Service, ServiceProps } from '@homeapi/ctsdk';
import set from 'lodash/set';
import { keyValueFromConfig } from '../../charts/utils/kv-from-config.util';

export class WebService extends Service {

  protected readonly config!: WebServiceProps['web']

  constructor(
    protected readonly compose: Compose,
    protected readonly name: string,
    props: WebServiceProps,
  ) {
    super(compose, name, props.serviceProps);

    this.config = props.web
    this.addLabels();
    this.addEnv();
  }

  protected addEnv(): void {
    if (!this._props.environment) this._props.environment = [];

    this._props.environment.push(
      ...keyValueFromConfig({
        DD_SERVICE: this.name,
        DD_VERSION: '1.0.0',
      }),
    );
  }

  protected addLabels(): void {
    if (!this._props.labels) this._props.labels = [];

    const labels = {
      com: {
        datadoghq: {
          tags: {
            service: this.name,
            version: '1.0.0',
          },
        },
      },
      traefik: {
        enable: true,
        port: this.config.port || 80,
        docker: { network: 'traefik_webproxy' },
        http: {
          services: {
            [this[Construct_ID]]: {
              loadbalancer: { server: { port: this.config.port || 80 } },
            }
          },
          routers: {
            [`${this[Construct_ID]}unsecure`]: {
              entrypoints: 'web',
              rule: this.config.match,
              service: this[Construct_ID],
              middlewares: "forward-auth",
            },
            [this[Construct_ID]]: {
              entrypoints: 'websecure',
              rule: this.config.match,
              service: this[Construct_ID],
              middlewares: "forward-auth",
              tls: {
                certresolver: 'le',
              },
            },
          },
        },
      },
    }

    if (!this.config.requiresAuth) {
      delete labels.traefik.http.routers[`${this[Construct_ID]}unsecure`].middlewares
      delete labels.traefik.http.routers[`${this[Construct_ID]}`].middlewares
    }

    if (!this.config.allowHttp && !this.config.unsecure) {
      delete labels.traefik.http.routers[`${this[Construct_ID]}unsecure`]
    }

    if (this.config.unsecure) {
      delete labels.traefik.http.routers[this[Construct_ID]]
    }

    this._props.labels.push(...keyValueFromConfig(labels));

    // find a better way to do dis
    // in swarm mode labels should be on service (ie= deploy) NOT on container
    if (!this.props?.deploy?.labels) set(this._props, 'deploy.labels', {});

    this._props.deploy.labels = Object.assign(
      
      [...keyValueFromConfig(labels), ...(Array.isArray(this._props.deploy.labels) ? this._props.deploy.labels as KeyValue[] : [])]
        .reduce((acc, curr) => {
      acc[curr.key] = (['string', 'number', null].includes(typeof curr.value)) ? curr.value : JSON.stringify(curr.value)
      return acc
    }, {}), Array.isArray(this._props.deploy.labels) ? {} : this._props.deploy.labels)

  }
}

export interface WebServiceProps {
  web: {
    /** traefik match string */
    match: string;
    unsecure?: boolean;
    allowHttp?: boolean;
    requiresAuth?: boolean;
    /** 
     * container port to use
     * default: 80
     */
    port?: number
  };
  serviceProps?: ServiceProps;
}
