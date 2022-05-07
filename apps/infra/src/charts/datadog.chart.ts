import { Construct } from 'constructs';
import { Chart, Helm } from 'cdk8s';
import { WebService } from '../constructs/web-service';
import { KubePersistentVolumeClaim, Quantity } from '@homeapi/k8s';
import { Inject, Injectable } from '@nestjs/common';
import { CDK8SApp } from '../app.service';

@Injectable()
export class DataDog extends Chart {
  constructor(protected readonly scope: CDK8SApp) {
    super(scope, 'datadog');
    // helm install RELEASE_NAME -f datadog-values.yaml --set datadog.site='datadoghq.eu' --set datadog.apiKey='4755d63d886358b7f564e25b291a52e3' 
    const dd = new Helm(this, 'datadog', {
      chart: 'datadog/datadog',
      values: {
        datadog: {
          logs: {
            enabled: true,
            containerCollectAll: true,
          },
          site: 'datadoghq.eu',
          apiKey:'4755d63d886358b7f564e25b291a52e3'
        }
      }
    });
  }
}
