import { Construct } from 'constructs';
import { Chart } from 'cdk8s';
import { WebService } from '../constructs/web-service';

export class HomeAPI extends Chart {
  constructor(scope: Construct) {
    super(scope, 'homeapi');

    new WebService(this, 'homeapi', {
      image: 'superd22/homeapi',
      match: 'Host(`home.davidfain.com`) && PathPrefix(`/graphql`)',
      port: 3000,
      replicas: 1,
    });
  }
}
