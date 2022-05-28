import { App, Construct, Construct_ID } from '../../sdk';
import { Service } from './service.construct';
import { ComposeSpecification, DefinitionsService } from '../compose-v3';
import { stringify } from 'yaml';
import { Volume } from './volumes/volume.construct';
import { Network } from './network.construct';

export class Compose extends Construct<ComposeProps, App> {

  constructor(
    scope: App,
    name: string,
    props?: ComposeProps
  ) {
    super(scope, name, props)
    
    if (!props?.name && this.constructor.name !== Compose.name) {
      this._props.name =  this.constructor.name.toLowerCase()
    }

    if (props?.name === null) delete this._props.name
  }

  public toYAML(): string {
    const props = { ...this._props } as ComposeProps;
    const compose = {
      ...props,
      services: this.returnInternalObject(Service),
      volumes: this.returnInternalObject(Volume),
      networks: this.returnInternalObject(Network),
    } as ComposeSpecification

    return stringify(compose)
  }

  protected returnInternalObject<T extends new (...args:any[]) => Construct<any>>(ConstructType: T) {
    const matchingInternals  = this.internals.filter(i => i instanceof ConstructType)
    if (!matchingInternals?.length) return
    return matchingInternals.reduce((acc, construct) => {acc[construct[Construct_ID]] = construct; return acc}, {})
  }
}

interface ComposeProps extends Pick<ComposeSpecification, 'name' | 'version'> {}