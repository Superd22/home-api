import { Compose } from "../compose.construct";
import { Config } from "./config.construct";

export class YAMLConfig<T extends Record<string | number, any>> extends Config {
  constructor(
    scope: Compose,
    name: string,
    data: T
  ) {

    )

    super(scope, name, {
      file
    })
  }
}