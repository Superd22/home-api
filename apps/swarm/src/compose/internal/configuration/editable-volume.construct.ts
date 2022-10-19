import { Compose, Volume, VolumeProps } from "@homeapi/ctsdk";
import { AvailableNodes } from "apps/swarm/src/charts/node-selector";
import { NetworkVolume } from "../network-volume/network.volume";
import { Code } from "./code.compose";

/**
 * Represents a volume that is editable by code-server
 */
export class EditableVolume extends Volume {

  public readonly networkVolume!: NetworkVolume

  constructor(
    scope: Compose,
    name: string,
    node: AvailableNodes,
  ) {
    super(scope, name, {})
    this.networkVolume = new NetworkVolume(scope, name, { node, fromExternal: this })
    Code.registerVolume(this)
  }

}