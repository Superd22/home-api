import { Enumerable } from "../decorators/enumerable.decorator"

/**
 * Represents a value that can be converted to YAML down the line
 */
export class Node<Props extends Object> {

  /** internal data not supplied to YAML */
  protected _data: unknown

  constructor(props?: Props) {
    Enumerable(false)(this, '_data')

    if(props) {
      Object.assign(this, this.editProps(props))
    }
  }


  protected editProps(props: Props): Props {
    return { ...props }
  }
}

// @ts-ignore
export interface Node<Props extends Object> extends Props {} 