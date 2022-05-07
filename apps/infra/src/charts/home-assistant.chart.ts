import { Construct } from 'constructs';
import { Chart } from 'cdk8s';
import { WebService } from '../constructs/web-service';
import { KubePersistentVolumeClaim, Quantity } from '@homeapi/k8s';
import { Inject, Injectable } from '@nestjs/common';
import { CDK8SApp } from '../app.service';
@Injectable()
export class HomeAssistant extends Chart {
  constructor(protected readonly scope: CDK8SApp) {
    super(scope, 'homeassitant');

    const volumeClaim = new KubePersistentVolumeClaim(this, 'volume', {
      metadata: {
        name: 'homeassistant-volume',
      },
      spec: {
        accessModes: ['ReadWriteOnce'],
        storageClassName: 'local-path',
        resources: { requests: { storage: Quantity.fromString('2Gi') } },
      },
    });

    new WebService(this, 'service', {
      image: 'ghcr.io/home-assistant/home-assistant:stable',
      containerOptions: {
        imagePullPolicy: 'Always',
        volumeMounts: [{ name: 'config', mountPath: '/config' }],
      },
      volumes: [
        {
          name: 'config',
          persistentVolumeClaim: { claimName: volumeClaim.name },
        },
      ],
      match: 'Host(`home.davidfain.com`)',
      port: 8123,
      replicas: 1,
    });
  }
}
