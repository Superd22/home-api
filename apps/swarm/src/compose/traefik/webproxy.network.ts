import { Construct_ID, Network } from '@homeapi/ctsdk';
import {  Injectable } from '@nestjs/common';
import { Traefik } from './traefik.compose';

@Injectable()
/**
 * Main shared overlay network between hosts
 */
export class WebProxyNetwork extends Network {

  constructor(
    protected readonly traefik: Traefik,
  ) {
    super(traefik, 'webproxy', {
      driver: 'overlay',
      attachable: true
    });
  }

}
