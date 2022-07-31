import { App, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { keyValueFromConfig } from '../charts/utils/kv-from-config.util';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { WebService } from '../services/web-service/webservice.chart';
import { SwarmApp } from '../swarm.service';
import { NetworkVolume } from './internal/network-volume/network.volume';

@Injectable()
export class Swarmpit extends Compose {

  protected network = new Network(this, 'pitnet')

  protected db_data = new Volume(this, 'db-data')
  protected influx_data = new Volume(this, 'influx-data')



  protected db = new Service(this, 'db', {
    image: "treehouses/couchdb:2.3.1",
    volumes: [
      `${this.db_data.id(this)}:/opt/couchdb/data`
    ],
    networks: {
      [`${this.network.id(this)}`]: null,
    }
  })

  protected influxDb = new Service(this, 'influx-db', {
    image: 'influxdb:1.7',
    volumes: [
      `${this.influx_data.id(this)}:/var/lib/influxdb`
    ],
    networks: {
      [`${this.network.id(this)}`]: null,
    }
  })

  protected agent = new Service(this, 'agent', {
    image: 'swarmpit/agent:latest',
    volumes: [
      '/var/run/docker.sock:/var/run/docker.sock:ro',
    ],
    deploy: {
      mode: 'global',
      labels: keyValueFromConfig({
        swarmpit: {
          agent: true
        }
      })
    },
    networks: {
      [`${this.network.id(this)}`]: null,
    }
  })


  constructor(
    protected readonly app: SwarmApp,
    protected readonly web: WebServiceFactory,
  ) {
    super(app, Swarmpit.name, { version: '3.6', name: null });

    this.web.webService(this, 'swarmpit', {
      serviceProps: {
        image: 'swarmpit/swarmpit:latest',
        environment: keyValueFromConfig({
          SWARMPIT_DB: `http://${this.db.id()}:5984`,
          SWARMPIT_INFLUXDB: `http://${this.influxDb.id()}:8086`
        }),
        volumes: [
          `/var/run/docker.sock:/var/run/docker.sock:ro`
        ],
        healthcheck: {
          test: ["CMD", "curl", "-f", "http://localhost:8080"],
          interval: "60s",
          timeout: "10s",
          retries: 3,
        },
        networks: {
          [`${this.network.id(this)}`]: null,
        },
        deploy: {
          placement: {
            constraints: ['node.role == manager']
          }
        }
      },
      web: {
        match: "Host(`swarmpit.davidfain.com`)",
        port: 8080,
        requiresAuth: true
      }

    })

    new NodeSelector(this.db, AvailableNodes.Galactica)
    new NodeSelector(this.influxDb, AvailableNodes.Galactica)
  }
}
