import { ContainerPort } from "@homeapi/k8s";
import { Injectable } from "@nestjs/common";

/**
 * Helper service to register ingresses into the kluster through
 * traefik
 */
@Injectable()
export class IngressService {

  /**
   * Internal list of ingresses
   */
  protected readonly _ingresses: IngressPort[] = [
    {
      name: 'web',
      hostPort: 80,
    },
    {
      name: 'websecure',
      hostPort: 443,
    },
    {
      name: 'admin',
      hostPort: 8080,
    },
  ]

  public get ingresses(): IngressPort[] {
    return [...this._ingresses]
  }

  /**
   * Registers a port, opening it up in traefik.
   * ports must be named in traefik
   */
  public addIngress(port: IngressPort): void {
   const existing = this._ingresses.find(i => i.name === port.name || i.hostPort === port.hostPort)  

   if(existing) {
     throw new Error(`Existing ingress port ${port}`)
   }

   this._ingresses.push(port)
  }



}

export type IngressPort = { 
  /** name of the entrypoint in traefik */
  name: string,
  /** host port to bind to */
  hostPort: number,
  /** protocol, default TCP */
  protocol?: 'TCP' | 'UDP'
 }