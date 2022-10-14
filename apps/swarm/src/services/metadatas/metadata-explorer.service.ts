import { Compose } from "@homeapi/ctsdk";
import { Injectable, Type } from "@nestjs/common";
import { ModuleRef, ModulesContainer } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { Module } from "@nestjs/core/injector/module";
import { ISynthAfterCompose, SynthAfterCompose, SYNTH_AFTER_COMPOSE_METADATA } from "./after-compose.decorator";


@Injectable()
export class MetadataExplorerService {

  constructor(
    protected readonly modulesContainer: ModulesContainer
  ) { }

  public synthAfterCompose(): (ISynthAfterCompose | Compose)[] {
    const modules = [...this.modulesContainer.values()]

    return this.flatMap<SYNTH_AFTER_COMPOSE_METADATA['class'], true>(modules, (instance) =>
      this.filterProvider(instance, SYNTH_AFTER_COMPOSE_METADATA)
    ).map(type => this.findModuleRefOfProvider(type).get(type))
  }


  protected flatMap<T, IsAlreadyType extends boolean = false>(
    modules: Module[],
    callback: (instance: InstanceWrapper) => Type<any> | undefined,
  ): IsAlreadyType extends true ? T[] : Type<T>[] {
    const items = modules
      .map((module) => [...module.providers.values()].map(callback))
      .reduce((a, b) => a.concat(b), [])
    return items.filter((element) => !!element) as IsAlreadyType extends true ? T[] : Type<T>[]
  }

  protected filterProvider(
    wrapper: InstanceWrapper,
    metadataKey: string | symbol,
  ): Type<any> | undefined {
    const { instance } = wrapper
    if (!instance) {
      return undefined
    }
    return this.extractMetadata(instance, metadataKey)
  }

  protected extractMetadata(
    instance: Record<string, any>,
    metadataKey: string | symbol,
  ): Type<any> {
    if (!instance.constructor) {
      return
    }
    const metadata = Reflect.getMetadata(metadataKey, instance.constructor)
    return metadata ? (instance.constructor as Type<any>) : undefined
  }

  protected findModuleRefOfProvider<T>(
    provider: Type<T>,
  ): ModuleRef {
    const parentModule = Array.from(this.modulesContainer.values())
      .find(module => module.hasProvider(provider))

    if (!parentModule) throw new Error(`Could not find provider: ${provider.name}`)

    const moduleRef = parentModule?.providers.get(ModuleRef)

    if (!moduleRef) throw new Error(`Could not find ModuleRef in module for provider: ${provider.name}`)

    return moduleRef.instance as ModuleRef
  }

}