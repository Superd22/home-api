import { Node } from '../../sdk'
import { DefinitionsService, ListOfStrings } from '../compose-v3'
import { Volume } from '../constructs'

export type ServiceVolumeProps = DefinitionsService['volumes'] extends Array<infer T> ? 
  Extract<T, Record<any, any>>
  : never

export class ServiceNetwork extends Node<DefinitionsService> {
  
  constructor(serviceVolumeProps: ServiceVolumeProps)
  constructor(volume: Volume, data?: Omit<ServiceVolumeProps, 'type' | 'source'>)
  constructor(propsOrVolume: ServiceVolumeProps | Volume, data?:  Omit<ServiceVolumeProps, 'type' | 'source'>) {
    if (propsOrVolume instanceof Volume) {
      super({ type: 'volume',  sourcSe: propsOrVolume.id(), ...data })
    }
    
    
  }

  public get key(): string {
    return this._props.key
  }

  public set key(key: string) {
    this._props.key = key
  }

  public get value(): unknown {
    return this._props.value
  }

  protected toJSON(): string {
    return `${this._props.key}=${this._props.value}`
  }

}

export interface ServiceNetworkProps {
  aliases?: ListOfStrings;
  ipv4_address?: string;
  ipv6_address?: string;
  link_local_ips?: ListOfStrings;
  priority?: number;
  /**
   * This interface was referenced by `undefined`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}