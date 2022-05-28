import { Compose } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { Config } from '../config.encrypted';
import { SwarmApp } from '../swarm.service';
import { LaunchThroughComposeService } from './internal/dind/dind.service';

@Injectable()
export class DataDog extends Compose {
  constructor(app: SwarmApp, config: Config) {
    super(app, DataDog.name, { name: null, version: '3.6' });

    new LaunchThroughComposeService(
      this,
      'datadog',
      {
        image: 'gcr.io/datadoghq/agent:latest',
        environment: [
          { key: 'DD_API_KEY', value: config.datadog.apiKey },
          { key: 'DD_SITE', value: 'datadoghq.eu' },
          { key: 'DD_LOGS_ENABLED', value: true },
          { key: 'DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL', value: true },
          ...keyValueFromConfig({
            DD_SYSTEM_PROBE_ENABLED: true,
            DD_PROCESS_AGENT_ENABLED: true,
          }),
        ],
        cap_add: [
          'SYS_ADMIN',
          'SYS_RESOURCE',
          'SYS_PTRACE',
          'NET_ADMIN',
          'NET_BROADCAST',
          'NET_RAW',
          'IPC_LOCK',
          'CHOWN',
        ],
        security_opt: ['apparmor:unconfined'],
        volumes: [
          '/var/run/docker.sock:/var/run/docker.sock',
          '/proc/:/host/proc/:ro',
          '/sys/fs/cgroup:/host/sys/fs/cgroup:ro',
          '/var/lib/docker/containers:/var/lib/docker/containers:ro',
          '/sys/kernel/debug:/sys/kernel/debug',
        ],
      },
      {
        deploy: {
          mode: 'global',
        },
      },
    );
  }
}
