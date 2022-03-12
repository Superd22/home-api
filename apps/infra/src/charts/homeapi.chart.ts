import { Construct } from 'constructs';
import { Chart } from 'cdk8s';
import { WebService } from '../constructs/web-service';
import { Inject, Injectable } from '@nestjs/common';
import { CDK8SApp } from '../app.service';

@Injectable()
export class HomeAPI extends Chart {
  constructor(protected readonly scope: CDK8SApp) {
    super(scope, 'homeapi');

    new WebService(this, 'homeapi', {
      image: 'superd22/homeapi',
      match: 'Host(`home.davidfain.com`) && PathPrefix(`/graphql`)',
      port: 3000,
      replicas: 1,
    });
  }
}
