import { Node } from '../../sdk'
import { ListOfStrings } from '../compose-v3'

export class ServiceNetwork extends Node<ServiceNetworkProps> {
  
  constructor(props: KeyValue) {
    if (props instanceof KeyValueImpl) return props
    super(props)
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