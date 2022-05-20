/**
 * Represents a value that can be converted to YAML down the line
 */
export class Node<Props extends Object> {

  /** data supplied to YAML */
  protected _props: Props = {} as Props

  public get props(): Readonly<Props> {
    return { ...this._props }
  }

  constructor(props?: Props) {
    if(props) {
      this._props = this.editProps(props)
    }
  }

  protected toJSON(): Props | string {
    return { ...this._props }
  }

  protected editProps(props: Props): Props {
    return { ...props }
  }

}
