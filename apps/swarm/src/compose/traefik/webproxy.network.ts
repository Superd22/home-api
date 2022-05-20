import { Construct_ID, Network } from '@homeapi/ctsdk';
import {  Injectable } from '@nestjs/common';
import { Traefik } from './traefik.compose';

@Injectable()
/**
 * Main shared overlay network between hosts
 */
export class WebProxyNetwork extends Network {

  public get id(): string {
    return `${this.traefik[Construct_ID]}_${this[Construct_ID]}`
  }

  constructor(
    protected readonly traefik: Traefik,
  ) {
    super(traefik, 'webproxy', {
      driver: 'overlay',
      attachable: true
    });
  }

}
