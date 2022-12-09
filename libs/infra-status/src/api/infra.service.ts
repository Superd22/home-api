import { Injectable, Scope } from "@nestjs/common";
import ssh from 'docker-modem/lib/ssh'
import Docker from 'dockerode'

@Injectable()
export class InfraService {

  public readonly docker = new Docker(
    process.env.NODE_ENV === 'prod' ?
      {
        socketPath: '/var/run/docker.sock'
      } :
      {
        agent: ssh({
          host: '192.168.1.48',
          username: 'freebox',
          privateKey: require('fs').readFileSync('/home/david/.ssh/id_rsa')
        })
      } as any
    );


}