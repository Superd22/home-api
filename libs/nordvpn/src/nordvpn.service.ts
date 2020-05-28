import { Injectable, Logger, HttpService } from '@nestjs/common'
import { registerEnumType } from '@nestjs/graphql'
import { execSync } from 'child_process'
import * as fs from 'fs'
import SSH2Promise = require('ssh2-promise');

/**
 * Allows fetching NordVPN api for stats about servers
 */
@Injectable()
export class NordvpnService {
    
    protected readonly logger = new Logger('VPN_SERVICE')

    constructor(
        protected readonly http: HttpService
    ) {}

    /** endpoint url for nordvpn */
    protected readonly api: string = 'https://nordvpn.com/api/server/stats'


    /**
     * Fetch a sever below 30% usage in a given region
     */
    public async fetchBestServerForRegion(region: NordVPNRegion) {
        const servers = await this.http.get<NordVPNServers>(this.api).toPromise()
        
        let [server] = Object.entries(servers.data)
            .find(([server, load]) => server.startsWith(region) && load.percent < 10)
        if (!server) [server] = Object.entries(servers.data)
            .find(([server, load]) => server.startsWith(region) && load.percent < 30)
        if (!server) [server] = Object.entries(servers.data)
                    .find(([server, load]) => server.startsWith(region) && load.percent < 50)
        
        return server
    }

    /**
     * Downloads a ovpn config file for the given server
     * @param serverName serverId.nordvpn.com
     */
    public async setupVPNConf(serverName: string): Promise<string> {
        const file = await this.http.get<string>(`https://downloads.nordcdn.com/configs/files/ovpn_legacy/servers/${serverName}.udp1194.ovpn`).toPromise()
        // Ensure that we use our identity
        const ovpnConf = file.data.replace('auth-user-pass', 'auth-user-pass /etc/openvpn/identity')

        await new Promise((resolve, reject) => fs.writeFile(`${__dirname}/../../../volumes/openvpn_clients/${serverName}.conf`, ovpnConf, (err) => {
            if(err) reject(err)
            else resolve()
        }));
        
        return ovpnConf
    }
    
    protected async sshToHost(): Promise<SSH2Promise> {
        const sshConfig = {
            host: await this.findHostIP(),
            username: 'homeapi',
            identity: `${__dirname}/../../../.ssh/id_rsa`,
        }

        const ssh = new SSH2Promise(sshConfig)
        this.logger.debug('Created SSH config')
        this.logger.debug(sshConfig)
        return ssh
    }

    protected async execSsh(ssh: SSH2Promise, cmd: string): Promise<string> {
        this.logger.debug(`ssh ${cmd}`)
        const buff = await ssh.exec(cmd)
        let output = ""
        if (buff instanceof Buffer) {
            output = buff.toString('utf-8')
        } else output = buff
        this.logger.debug(`[SSH] ${output}`)
        return output;
    }

    public async openVPNTunnel(serverName: string): Promise<boolean> {
        const ssh = await this.sshToHost()
        await this.closeVPNTunnel(ssh)

        try {
            if (process.env.NODE_ENV !== 'prod') return true
            this.logger.log('Connecting VPN...')
            await this.execSsh(ssh, `sudo systemctl start openvpn-client@${serverName}`)
            // Reroute all traffic not targeting 192.168.x.x through tun0
            await this.execSsh(ssh, `sudo iptables -t nat -A POSTROUTING -s 192.168.1.0/16 \! -d 192.168.1.0/16 -o tun0 -j MASQUERADE`)
            
            return true
        } catch(e) {
            this.logger.error(e.toString())
            await this.closeVPNTunnel()
            return false
        } finally {
            await ssh.close()
        }
    }

    protected async closeVPNTunnel(ssh?: SSH2Promise): Promise<boolean> {
        if (!ssh) ssh = await this.sshToHost()
        try {
            if (process.env.NODE_ENV !== 'prod') return true
            await this.execSsh(ssh, `sudo systemctl stop openvpn-client@*`)
            // await this.execSsh(ssh, `sudo iptables -F`)
            // await this.execSsh(ssh, `sudo iptables -t nat -F`)
            return true
        } catch(e) {
            this.logger.error(e.toString())
            return false
        } finally {
            await ssh.close()
        }
    }

    /**
     * From inside docker container, find host ip for ssh
     */
    protected async findHostIP(): Promise<string> {
        return execSync(`ip route show default | awk '/default/ {print $3}'`, { encoding: 'utf8' }).trim()
    }

}

export enum NordVPNRegion {
    us = 'us',
    uk = 'uk',
    ca = 'ca',
}

registerEnumType(NordVPNRegion, { name: 'VPNRegion' })

/**
 * Maps of available servers in nordVPN
 */
interface NordVPNServers {
    [serverName:string]: {
        /** load percent of this server */
        percent: number
    }
}