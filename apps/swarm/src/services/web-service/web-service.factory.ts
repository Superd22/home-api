import { Compose, Network } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { WebProxyNetwork } from '../../compose/traefik/webproxy.network';
import { WebService, WebServiceProps } from './webservice.chart';

@Injectable()
export class WebServiceFactory {
  constructor(protected readonly network: WebProxyNetwork) {}

  public webService(
    compose: Compose,
    name: string,
    props: WebServiceProps,
  ): WebService {
    ((compose as any).addConstruct as Compose['addConstruct'])(
      new Network(compose, this.network.id, {
        external: { name: this.network.id },
      }),
    );

    return new WebService(compose, name, {
      ...props,
      serviceProps: {
        ...props.serviceProps,
        networks: {
          ...(props.serviceProps?.networks || {}),
          [this.network.id]: {},
        },
      },
    });
  }
}
