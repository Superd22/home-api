import { Node } from '../../sdk'

export class KeyValueImpl extends Node<KeyValue> {
  
  protected toJSON(): string {
    return `${this.key}=${this.value}`
  }

}

export interface KeyValue {
  key: string
  value: unknown
}