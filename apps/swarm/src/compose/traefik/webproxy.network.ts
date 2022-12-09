import { Compose, Construct_ID, Network } from '@homeapi/ctsdk';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TraefikService } from './traefik.compose';

@Injectable()
/**
 * Main shared overlay network between hosts
 */
export class WebProxyNetwork extends Network {

  constructor(
    protected readonly traefik: TraefikService,
  ) {
    super(new Compose(undefined, 'traefik'), 'webproxy', {
      driver: 'overlay',
      attachable: true
    });
  }

}
