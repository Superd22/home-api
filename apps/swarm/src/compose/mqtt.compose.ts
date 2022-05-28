import { App, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../charts/node-selector';
import { WebServiceFactory } from '../services/web-service/web-service.factory';
import { WebService } from '../services/web-service/webservice.chart';
import { SwarmApp } from '../swarm.service';

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
    protected readonly webServiceFactory: WebServiceFactory,
  ) {
    super(app, MQTT.name, { name: null, version: "3.8" });

   
    const service = new Service(this, 'server', {
      image: 'eclipse-mosquitto',
      ports: [{ mode: 'host', published: 1883, target: 1883 }],
      volumes: [
        `${new Volume(this, 'config', null).id(this)}:/mosquitto/config`,
        `${new Volume(this, 'data', null).id(this)}:/mosquitto/data`,
      ],
    })


    new NodeSelector(service, AvailableNodes.HomeAPI)
  }
}
