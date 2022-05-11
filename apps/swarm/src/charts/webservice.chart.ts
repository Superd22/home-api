import { Compose, Construct_ID, Service, ServiceProps } from '@homeapi/ctsdk';
import { keyValueFromConfig } from './utils/kv-from-config.util';

export class WebService extends Service {
  protected _data: WebServiceProps['web'];

  constructor(compose: Compose, name: string, props: WebServiceProps) {
    super(compose, name, props.serviceProps);
    this._data = props.web;

    this.addLabels();
  }

  protected addLabels(): void {
    if (!this.labels) this.labels = [];

    this.labels.push(
      ...keyValueFromConfig({
        traefik: {
          docker: { network: 'webproxy' },
          http: {
            routers: {
              [this[Construct_ID]]: {
                entrypoints: 'websecure',
                rule: this._data.match,
                service: this[Construct_ID],
                tls: true,
                certresolver: 'le',
                loadbalancer: { server: { port: 80 } },
              },
            },
          },
        },
      }),
    );
  }
}

export interface WebServiceProps {
  web: {
    /** traefik match string */
    match: string;
    allowHttp?: boolean
    
  };
  serviceProps?: ServiceProps;
}
