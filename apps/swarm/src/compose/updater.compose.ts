import { Compose, Service } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';

@Injectable()
export class Updater extends Compose {

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

  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, Updater.name, { version: '3.6', name: null });
    new NodeSelector(this.updater, AvailableNodes.HomeAPI)
  }

}

