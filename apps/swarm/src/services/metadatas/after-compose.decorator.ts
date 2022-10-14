import { Compose } from "@homeapi/ctsdk";

export const SYNTH_AFTER_COMPOSE_METADATA = Symbol('metadata for synth after compoe provider')
export interface SYNTH_AFTER_COMPOSE_METADATA {
  class: new (...args: any[]) => ISynthAfterCompose | Compose
}

/**
 * Provider that should be synthed after everything other static
 * compose is synthed
 */
export interface ISynthAfterCompose {
  synth(): Compose
}

export function SynthAfterCompose() {
  return (prototype: new (...args: any[]) => ISynthAfterCompose | Compose) => {
    Reflect.defineMetadata(
      SYNTH_AFTER_COMPOSE_METADATA,
      { class: prototype } as SYNTH_AFTER_COMPOSE_METADATA,
      prototype
    )
  }
}