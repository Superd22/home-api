import { Compose, Construct_ID, KeyValue, Service, ServiceProps } from '@homeapi/ctsdk';
import { keyValueFromConfig } from '../../charts/utils/kv-from-config.util';
import set from 'lodash/set'
import { AuthMiddlewares, AuthRule } from './auths-middleware.chart';

export class WebService extends Service {

  protected readonly config!: WebServiceProps['web']

  protected readonly authsMiddlewareService = AuthMiddlewares.instance

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
    
    if (this.config.requiresAuth === true) {
      this.config.requiresAuth = new AuthRule({ whitelist: ['superd001@gmail.com'] })
    }

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
              middlewares: "forward-auth" + (this.config.requiresAuth as AuthRule)?.id,
            },
            [this[Construct_ID]]: {
              entrypoints: 'websecure',
              rule: this.config.match,
              service: this[Construct_ID],
              middlewares: "forward-auth" + (this.config.requiresAuth as AuthRule)?.id,
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
    if (!this.props?.deploy?.labels) set(this._props, 'deploy.labels', []);

    (this._props.deploy.labels as any as KeyValue[]).push(...keyValueFromConfig(labels))

  }
}

export interface WebServiceProps {
  web: {
    /** traefik match string */
    match: string;
    unsecure?: boolean;
    allowHttp?: boolean;
    /**
     * Give an auth rule to ensure that no one can access this
     * service without authorizating
     * 
     * if true is given, auth will be required for default email address
     */
    requiresAuth?: boolean | AuthRule;
    /** 
     * container port to use
     * default: 80
     */
    port?: number
  };
  serviceProps?: ServiceProps;
}
