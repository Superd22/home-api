import { Compose } from "../compose.construct";
import { Construct } from "../../../sdk";
import { DefinitionsVolume } from "../../compose-v3";

export class Volume extends Construct<VolumeProps, Compose> {

}

export interface VolumeProps extends DefinitionsVolume { }