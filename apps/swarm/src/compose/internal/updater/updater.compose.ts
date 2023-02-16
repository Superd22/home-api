import { Compose, KeyValue, Service } from '@homeapi/ctsdk';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AvailableNodes, NodeSelector } from '../../../charts/node-selector';
import { keyValueFromConfig } from '../../../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../../../services/web-service/web-service.factory';
import { SwarmApp } from '../../../swarm.service';

@Injectable()
export class Updater extends Compose implements OnApplicationBootstrap {

  protected readonly logger: Logger = new Logger('Updater')

  protected updater = new Service(this, 'updater', {
    image: 'dockupdater/dockupdater',
    environment: keyValueFromConfig({
      LABEL: true,
    }),
    volumes: [
      "/home/freebox/.docker/config.json:/root/.docker/config.json",
      "/var/run/docker.sock:/var/run/docker.sock"
    ],
    deploy: {
      labels: keyValueFromConfig({
        'dockerupdate.enable': true,
      })
    }
  })


  protected static services: ServiceToUpdate[] = []


  public static addService(service: ServiceToUpdate) {
    this.services.push(service)
  }

  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
    protected readonly moduleRef: ModuleRef,
  ) {
    super(app, Updater.name, { version: '3.6', name: null });
    new NodeSelector(this.updater, AvailableNodes.HomeAPI)
  }

  public async onApplicationBootstrap() {
    for (const service of Updater.services) {
      const instance = await this.moduleRef.resolve(service.class)

      if (!instance || !(instance[service.name] instanceof Service)) {
        throw new Error(`${service.class.name}.${service.name} is not a valid service for @AutoUpdate`)
      }

      this.logger.debug(`Adding auto-update labels to service ${service.class.name}.${service.name}`)

      const serviceToUpdate= instance[service.name] as Service
      serviceToUpdate.props.deploy = serviceToUpdate.props.deploy || {}
      serviceToUpdate.props.deploy.labels = keyValueFromConfig(
        {
          "dockupdater.latest": true,
          "dockupdater.enable": true
        },
        serviceToUpdate.props?.deploy?.labels as KeyValue[],
      )
    }
  }

}


export interface ServiceToUpdate<T extends string = string> {
  class: new (...args: any[]) => { [key in T]: Service },
  name: T,
}
