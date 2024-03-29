import * as wesh from '../../sdk'

export class KeyValueImpl extends wesh.Node<KeyValue> implements KeyValue {

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

  public toJSON(): string {
    if (this._props.value === null) return `${this._props.key}`
    return `${this._props.key}=${this._props.value}`
  }

}

export interface KeyValue {
  key: string
  value: unknown
}