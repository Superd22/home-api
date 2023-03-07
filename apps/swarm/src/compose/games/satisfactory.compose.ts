import { Service, Volume } from "@homeapi/ctsdk";
import { Injectable } from "@nestjs/common";
import { AvailableNodes, NodeSelector } from "../../charts/node-selector";
import { keyValueFromConfig } from "../../charts/utils/kv-from-config.util";
import { WebServiceFactory } from "../../services/web-service/web-service.factory";
import { WebService } from "../../services/web-service/webservice.chart";
import { SwarmApp } from "../../swarm.service";
import { AutoUpdate } from "../internal";
import { TraefikService } from "../traefik/traefik.compose";
import { WebProxyNetwork } from "../traefik/webproxy.network";
import { GameServerCompose } from "./_.compose";

@Injectable()
export class Satisfactory extends GameServerCompose {

  protected readonly data = new Volume(this, 'data')

  @AutoUpdate()
  protected readonly service = new Service(this, 'server', {
    image: 'wolveix/satisfactory-server',
    expose: ['7777/udp', '15000/udp', '15777/udp'],
    volumes: [
      this.data.toService({ path: '/config' })
    ],
    deploy: {
      // trick to manually scale up/down
      replicas: 1,
      labels: keyValueFromConfig({
        game: {
          name: "Satisfactory",
        },
        traefik: {
          enable: true,
          docker: { network: 'traefik_webproxy' },
          udp: {
            services: {
              'satisfactory-2': {
                loadbalancer: { server: { port: '7777' } },
              },
              'satisfactory-1': {
                loadbalancer: { server: { port: '15000' } },
              },
              'satisfactory-0': {
                loadbalancer: { server: { port: '15777' } },
              }
            },
            routers: {
              'satisfactory-router-0': {
                entrypoints: 'satisfactory_0',
                service: 'satisfactory-0',
              },

              'satisfactory-router-1': {
                entrypoints: 'satisfactory_1',
                service: 'satisfactory-1',
              },

              'satisfactory-router-2': {
                entrypoints: 'satisfactory_2',
                service: 'satisfactory-2',
              }
            },
          },
        }
      }),
    },
    networks: {
      [this.network.id(this)]: {}
    },
    environment: keyValueFromConfig({
      MAXPLAYERS: 4,
    })
  })


  @AutoUpdate()
  protected readonly saves = this.webservice.webService(this, 'saves_server', {
    serviceProps: {
      image: 'halverneus/static-file-server:latest',
      volumes: [
        this.data.toService({ path: '/web' })
      ],
      environment: keyValueFromConfig({
        FOLDER: '/web/saved/server',
        CORS: true,
      })
    },
    web: {
      match: 'Host(`files.satisfactory.davidfain.com`)',
      port: 8080
    }
  });

  constructor(
    protected readonly app: SwarmApp,
    protected readonly traefik: TraefikService,
    protected readonly network: WebProxyNetwork,
    protected readonly webservice: WebServiceFactory,
  ) {

    super(
      app,
      Satisfactory.name,
      traefik,
      {
        ports: ['15777/udp', '15000/udp', '7777/udp']
      }
    )

    network.bind(this)
    new NodeSelector(this.service, AvailableNodes.Desktop)
    new NodeSelector(this.saves, AvailableNodes.Desktop)
  }

}