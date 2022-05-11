import { Compose, Service } from '@homeapi/ctsdk';
import { Enumerable } from '@homeapi/ctsdk/decorators/enumerable.decorator';
import { Injectable } from '@nestjs/common';
import { Config } from '../config.encrypted';
import { SwarmApp } from '../swarm.service';

@Injectable()
export class DataDog extends Compose {
  constructor(
    app: SwarmApp,
    config: Config
    ) {
    super(app, DataDog.name);

    new Service(this, 'datadog', {
      image: 'gcr.io/datadoghq/agent:latest',
      environment: [
        { key: 'DD_API_KEY', value: config.datadog.apiKey },
        { key: 'DD_SITE', value: 'datadoghq.eu' },
        { key: 'DD_LOGS_ENABLED', value: true },
        { key: 'DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL', value: true }
      ],
      volumes: [
        '/var/run/docker.sock:/var/run/docker.sock',
        '/proc/:/host/proc/:ro',
        '/sys/fs/cgroup:/host/sys/fs/cgroup:ro',
        '/var/lib/docker/containers:/var/lib/docker/containers:ro',
      ],
    });
  }
}
