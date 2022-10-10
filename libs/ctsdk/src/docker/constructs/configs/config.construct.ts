import { Construct } from "../../../sdk";
import { DefinitionsConfig, ServiceConfigOrSecret } from "../../compose-v3";
import { Compose } from "../compose.construct";

type Unpacked<T> = T extends (infer U)[] ? U : T;
export type LongServiceConfig = Extract<Unpacked<ServiceConfigOrSecret>, { source?: string }>

export class Config extends Construct<ConfigProps, Compose> {

  public service(
    data: { target?: string } = {}
  ): LongServiceConfig {
    if (!this._props.file) throw new Error("Config is not defined as file")

    return {
      source: this._props.file,
      target: this._props.file,
      ...data,
    }
  }

}


interface ConfigProps extends DefinitionsConfig { }