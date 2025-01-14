import { Compose, Service, Volume } from "@homeapi/ctsdk";
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
import { GameService, ReverseProxiedPort } from "./_.server";
import { valheimPassword } from "./valheim.encrypted";

@Injectable()
export class Valheim extends Compose {

  protected readonly ports: ReverseProxiedPort[] = ['2456/udp', '2457/udp']

  protected readonly configVolume = new Volume(this, 'config')
  protected readonly gameVolume = new Volume(this, 'game')

  @AutoUpdate()
  protected readonly server = new GameService(
    this, 
    'server', 
    {
      service: {
        image: 'ghcr.io/lloesche/valheim-server',
        expose: this.ports,
        volumes: [
          this.configVolume.toService({ path: '/config' }),
          this.gameVolume.toService({ path: '/opt/valheim' })
        ],
        environment: keyValueFromConfig({
          SERVER_NAME: "The big D",
          WORLD_NAME: "WestWorld",
          SERVER_PASS: valheimPassword,
          SERVER_ARGS: "-crossplay",
          BEPINEX: 'true'
        }),
        deploy: {
          replicas: 1
        }
      },
      ports: this.ports,
  },
  this.traefik,
  this.webservice
)


  constructor(
    protected readonly app: SwarmApp,
    protected readonly traefik: TraefikService,
    protected readonly network: WebProxyNetwork,
    protected readonly webservice: WebServiceFactory,
  ) {    
    super(app, 'valheim', {
    version: '3.6',
    name: null,
  });
    new NodeSelector(this.server, AvailableNodes.Desktop)
  }

}