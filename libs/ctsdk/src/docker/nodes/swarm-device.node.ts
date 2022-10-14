import { Node } from '../../sdk'
import { DefinitionsService, ListOfStrings } from '../compose-v3'
import { Volume } from '../constructs'

/**
 * Represents a device that can be added through the swarm.
 * This will mount the device as a volume and add label to the container 
 * so that our @see DevicerService can handle permissions
 */
export class SwarmDevice extends Node<{ devicePath: string }> {

  constructor(
    /** path of the device on the host: `/dev/input1` */
    devicePath: string
  ) {
    super({ devicePath })
  }


}