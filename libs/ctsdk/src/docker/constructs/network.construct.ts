import { Compose } from "./compose.construct";
import { Construct } from "../../sdk";
import { DefinitionsNetwork } from "../compose-v3";

export class Network extends Construct<NetworkProps, Compose> {

}

interface NetworkProps extends DefinitionsNetwork {}