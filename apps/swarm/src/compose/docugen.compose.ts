import { Compose } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { SwarmApp } from '../swarm.service';
import { AuthRule } from '../services/web-service/auths-middleware.chart';
import { Config } from '../config.encrypted';

@Injectable()
export class Docugen extends Compose {

  protected readonly backend = this.web.webService(this, 'backend', {
    web: {
      match: 'Host(`wmtn.docugen.davidfain.com`) && PathPrefix(`/api`)',
      requiresAuth: new AuthRule({ domains: ['wemaintain.com'] }),
      port: 3000
    },
    serviceProps: {
      image: 'ghcr.io/superd22/docugen/api'
    }
  })

  protected readonly frontend = this.web.webService(this, 'frontend', {
    web: {
      match: 'Host(`wmtn.docugen.davidfain.com`)',
      requiresAuth: new AuthRule({ domains: ['wemaintain.com'] }),
      port: 80
    },
    serviceProps: {
      image: 'ghcr.io/superd22/docugen/frontend',
      environment: keyValueFromConfig({
        GITHUB_TOKEN: this.config.docugen.ghToken,
        REPOSITORY: "wemaintain/backend",
        DOCUMENTATION_GH_RELEASE: true
      })
    }
  })

  constructor(
    protected readonly app: SwarmApp,
    protected readonly config: Config,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, Docugen.name, { version: '3.6', name: null });
  }
}
