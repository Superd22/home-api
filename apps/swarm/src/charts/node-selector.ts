import { Construct, Node, Service } from "@homeapi/ctsdk";
import { default as set } from 'lodash/set'

export class NodeSelector extends Construct<{ node: AvailableNodes }, Service> {

  constructor(scope: Service, node: AvailableNodes) {
    super(scope, 'todo', { node })
    // @todo this should really not be called by us
    this.onSynth()
  }

  /**
   * @todo this should really be a hook?
   */
  protected onSynth() {
    set(
      this.scope,
      `_props.deploy.placement.constraints`,
      [
        ...this.scope.props.deploy?.placement?.constraints || [],
        `node.hostname == ${this._props.node}`
      ]
    )
  }

}


export enum AvailableNodes {
  HomeAPI = "HomeAPI",
  Galactica = "Galactica",
  Desktop = "Desktop"
}