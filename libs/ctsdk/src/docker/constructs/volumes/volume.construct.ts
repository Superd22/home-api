import { Compose } from "../compose.construct";
import { Construct } from "../../../sdk";
import { DefinitionsService, DefinitionsVolume } from "../../compose-v3";
type Unpacked<T> = T extends (infer U)[] ? U : T;

export class Volume extends Construct<VolumeProps, Compose> {
  /**
   * Bind this volume in a service to the given path inside the container
   */
  public toService(opts: { path: string }, scope: Compose = this.scope): Unpacked<DefinitionsService['volumes']> {
    return {
      type: 'volume',
      source: this.id(scope),
      target: opts.path,
    }
  }
}

export interface VolumeProps extends DefinitionsVolume { }