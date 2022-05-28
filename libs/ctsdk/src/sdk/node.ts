import { stringify } from "yaml"

/**
 * Represents a value that can be converted to YAML down the line
 */
export class Node<Props extends Object> {

  /** data supplied to YAML */
  protected _props: Props = {} as Props

  public get props(): Props {
    return this._props
  }

  constructor(props?: Props) {
    if(props) {
      this._props = this.editProps(props)
    }
  }

  public toJSON(scope: Node<any> = this): Props | string {
    return { ...this._props }
  }


  public toYAML(): string {
    return stringify(this)
  }

  protected editProps(props: Props): Props {
    return { ...props }
  }

}
