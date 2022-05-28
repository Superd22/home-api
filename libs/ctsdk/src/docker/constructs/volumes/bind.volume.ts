import { Compose } from "../compose.construct";
import { Volume } from "./volume.construct";

/**
 * Named bind volume
 */
export class BindVolume extends Volume {
  constructor(scope: Compose, name: string, path: string) {
    super(scope, name, {
      driver_opts: {
        type: 'none',
        device: path,
        o: 'bind'
      }
    })
  }
}