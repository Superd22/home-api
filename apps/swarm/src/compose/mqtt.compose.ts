import { Compose, Service, Volume } from '@homeapi/ctsdk';
import { Inject, Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { SwarmApp } from '../swarm.service';
import { WebProxyNetwork } from './traefik/webproxy.network';

/**
 * version: '3'

services:
  mqtt:
    image: eclipse-mosquitto
    ports:
      - "1883:1883"
    volumes:
      - mqttconfig:/mosquitto/config
      - mqttdata:/mosquitto/data
    labels:
      # Books is the actual calibre public web interface
      - traefik.docker.network=webproxy
      - traefik.http.routers.mqtt.entrypoints=websecure
      - traefik.http.routers.mqtt.rule=Host(`mqtt.home.davidfain.com`)
      - traefik.http.routers.mqtt.service=mqtt
      - traefik.http.routers.mqtt.tls=true
      - traefik.http.routers.mqtt.tls.certresolver=le
      - traefik.http.routers.mqttunsecure.entrypoints=web
      - traefik.http.routers.mqttunsecure.rule=Host(`mqtt.home.davidfain.com`)
      - traefik.http.routers.mqttunsecure.service=mqtt
      - traefik.http.services.mqtt.loadbalancer.server.port=9001
networks:
  webproxy:
      name: webproxy
volumes:
  mqttconfig:
  mqttdata: 
 * 
 */


@Injectable()
export class MQTT extends Compose {
  constructor(
    app: SwarmApp,
    @Inject(WebProxyNetwork)
    protected readonly network: WebProxyNetwork
  ) {
    super(app, MQTT.name, { name: null, version: "3.8" });

   
    const service = new Service(this, 'server', {
      image: 'eclipse-mosquitto',
      ports: [{ mode: 'host', published: 1883, target: 1883 }],
      networks: {
        ...this.network.toService(this)
      },
      volumes: [
        new Volume(this, 'config').toService({ path: '/mosquitto/config' }),
        new Volume(this, 'data').toService({ path: '/mosquitto/data' }),
      ],
    })

    this.network.bind(this)


    new NodeSelector(service, AvailableNodes.HomeAPI)
  }
}
