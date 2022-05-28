import { BindVolume, Compose, Network, Port, Service, Volume } from '@homeapi/ctsdk';
import { Injectable } from '@nestjs/common';
import { AvailableNodes, NodeSelector } from '../../charts/node-selector';
import { keyValueFromConfig } from '../../charts/utils/kv-from-config.util';
import { Config } from '../../config.encrypted';
import { SwarmApp } from '../../swarm.service';
import { NetworkVolume } from '../internal/network-volume/network.volume';
import { reverseProxyToWeb } from '../traefik/reverse-proxy-to-web';
import { WebProxyNetwork } from '../traefik/webproxy.network';
import { PlexNetwork } from './plex.network';

@Injectable()
/**
 * Plex server + UnicornLoadBalancer to allow multiple nodes to handle transcoding
 */
export class Plex extends Compose {
  protected readonly timezone = 'Europe/Paris';

  protected readonly network = new PlexNetwork(this);


  protected readonly volumes = {
    'local-codecs' : new Volume(this, 'local-codecs'),
    tautulli: new Volume(this, 'tautuli-config'),
    'plex-media': new NetworkVolume(
      this,
      'plex-media',
      { node: AvailableNodes.Galactica, path: '/mnt/raid/0.SHARED/0.Media' }
    ),
    'plex-tmp': new NetworkVolume(
      this,
      'plex-tmp',
      { node: AvailableNodes.Galactica, path: '/mnt/raid/0.SHARED/0.Media/tmp' }
    ),
    'plex-config': new NetworkVolume(
      this,
      'plex-config',
      { node: AvailableNodes.Galactica, path: '/var/lib/plexmediaserver/' }
    ),
  };

  protected readonly tautulli = new Service(this, 'monitoring', {
    image: 'linuxserver/tautulli',
    networks: [this.webproxyNetwork.id(this)],
    environment: keyValueFromConfig({
      TZ: this.timezone,
    }),
    volumes: [
      'tautuli-config:/config',
      `/var/lib/plexmediaserver/Library/Application Support/Plex Media Server/Logs:/logs`,
    ],
  });

  protected readonly plex = new Service(this, 'server', {
    image: 'ghcr.io/pabloromeo/clusterplex_pms:latest',
    deploy: {
      replicas: 1,
    },
    networks: {
      /** @todo better API for this */
      [this.network.id(this)]: {},
      [this.webproxyNetwork.id(this)]: {},
    },
    volumes: [
      `${this.volumes['plex-media'].id(this)}:/mnt/media`,
      `${this.volumes['plex-tmp'].id(this)}:/tmp/plex-transcode:rw`,
      `${this.volumes['plex-config'].id(this)}:/config`,
      `${this.volumes['local-codecs'].id(this)}:/codecs:rw`,
      '/etc/localtime:/etc/localtime:ro'
    ],
    ports: [
      '32400:32400/tcp',
      '3005:3005/tcp',
      '8324:8324/tcp',
      '32469:32469/tcp',
      '1900:1900/udp',
      '32410:32410/udp',
      '32412:32412/udp',
      '32413:32413/udp',
      '32414:32414/udp',
    ].map(p => {
      const [_, containerPort, hostPort, protocol] = p.match(/([0-9]+):([0-9]+)\/(.*)/)
      return {
        target: Number(containerPort),
        published: Number(hostPort),
        protocol,
        mode: 'host'
      } as Port
  }) as Port[],
    
    environment: [
      ...keyValueFromConfig({
        VERSION: "docker",
        TZ: this.timezone,
        ORCHESTRATOR_URL: "http://tasks.plex_orchestrator:3500",
        PMS_IP: "82.64.125.168",
        TRANSCODE_OPERATING_MODE: "both",  // (local|remote|both)
        TRANSCODER_VERBOSE: "1" //   1=verbose, 0=silent
      }),
    ],
  });

  protected readonly orchestrator = new Service(this, 'orchestrator', {
    image: 'ghcr.io/pabloromeo/clusterplex_orchestrator:latest',
    volumes: [
      '/etc/localtime:/etc/localtime:ro'
    ],
    networks: {
      /** @todo better API for this */
      [this.network.id(this)]: {},
      [this.webproxyNetwork.id(this)]: {},
    },
    environment: [
      ...keyValueFromConfig({
        TZ: this.timezone,
        STREAM_SPLITTING: "OFF",
        LISTENING_PORT: 3500,
        WORKER_SELECTION_STRATEGY: "LOAD_RANK"
      })
    ]
  })

  // protected readonly transcoder_galactica =  new Service(this, 'transcoder', {
  //   image: 'ghcr.io/linuxserver/plex',
  //   hostname: "plex-worker-{{.Node.Hostname}}",
  //   networks: {
  //     [this.network.id(this)]: {},
  //     [this.webproxyNetwork.id(this)]: {}
  //   },
  //   volumes: [
  //     '/etc/localtime:/etc/localtime:ro',
  //     `${this.volumes['plex-media'].id(this)}:/mnt/media`,
  //     `${this.volumes['plex-tmp'].id(this)}:/tmp:rw`,
  //     `${this.volumes['local-codecs'].id(this)}:/codecs:rw`
  //   ],
  //   environment: keyValueFromConfig({
  //     DOCKER_MODS: "ghcr.io/pabloromeo/clusterplex_worker_dockermod:latest",
  //     VERSION: "docker",
  //     TZ: this.timezone,
  //     LISTENING_PORT: 3501,
  //     STAT_CPU_INTERVAL: 2000,
  //     ORCHESTRATOR_URL: "http://tasks.plex_orchestrator:3500"
  //   })
  // })

  // protected readonly transcoder_desktop =  new Service(this, 'transcoder_desktop', {
  //   image: 'ghcr.io/linuxserver/plex',
  //   hostname: "plex-worker-{{.Node.Hostname}}",
  //   networks: {
  //     [this.network.id(this)]: {},
  //     [this.webproxyNetwork.id(this)]: {}
  //   },
  //   volumes: [
  //     '/etc/localtime:/etc/localtime:ro',
  //     `${this.volumes['plex-media'].id(this)}:/mnt/media`,
  //     `${this.volumes['plex-tmp'].id(this)}:/tmp/plex-transcode:rw`,
  //     `${this.volumes['local-codecs'].id(this)}:/codecs:rw`
  //   ],
  //   environment: keyValueFromConfig({
  //     DOCKER_MODS: "ghcr.io/pabloromeo/clusterplex_worker_dockermod:latest",
  //     VERSION: "docker",
  //     TZ: this.timezone,
  //     LISTENING_PORT: 3501,
  //     STAT_CPU_INTERVAL: 2000,
  //     ORCHESTRATOR_URL: "http://tasks.plex_orchestrator:3500"
  //   })
  // })

  constructor(
    protected readonly app: SwarmApp,
    protected readonly webproxyNetwork: WebProxyNetwork,
    protected readonly config: Config,
  ) {
    super(app, Plex.name, { version: '3.6', name: null });

    webproxyNetwork.bind(this)

    // new NodeSelector(this.plex, AvailableNodes.Galactica);
    new NodeSelector(this.orchestrator, AvailableNodes.Galactica);
    new NodeSelector(this.tautulli, AvailableNodes.Galactica);
    // new NodeSelector(this.transcoder_galactica, AvailableNodes.Galactica)
    // new NodeSelector(this.transcoder_desktop, AvailableNodes.Desktop)

    reverseProxyToWeb(this.plex, {
      match: 'Host("plex.davidfain.com")',
      port: 3001,
    });
    reverseProxyToWeb(this.tautulli, {
      match: 'Host("dashboard.plex.davidfain.com")',
      port: 8181,
    });
    reverseProxyToWeb(this.orchestrator, {
      match: 'Host("orchestrator.plex.davidfain.com")',
      allowHttp: true,
      port: 3500,
    });
    // reverseProxyToWeb(this.transcoder_galactica, {
    //   match: 'Host("galactica.transcode.plex.davidfain.com")',
    //   port: 3501,
    // });
    // reverseProxyToWeb(this.transcoder_desktop, {
    //   match: 'Host("desktop.transcode.plex.davidfain.com")',
    //   port: 3501,
    // });
  }
}
