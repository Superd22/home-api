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
            port: 2022
        }

        const ssh = new SSH2Promise(sshConfig)
        this.logger.debug('Connecting to ssh...')
        this.logger.debug(sshConfig)
        return ssh.connect()
    }

    public async openVPNTunnel(serverName: string): Promise<boolean> {
        const ssh = await this.sshToHost()
        this.logger.log(`Connected to host`)
        await this.closeVPNTunnel(ssh)

        try {
            if (process.env.NODE_ENV !== 'prod') return true
            this.logger.log('Connecting VPN...')
            this.logger.log(await ssh.exec(`systemctl openvpn@${serverName}`))
            // Reroute all traffic not targeting 192.168.x.x through tun0
            this.logger.log(await ssh.exec(`iptables -t nat -A POSTROUTING -s 192.168.0.0/16 \! -d 192.168.0.0/16 -o tun0 -j MASQUERADE`))
            return true
        } catch(e) {
            console.error(e);
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
            await ssh.exec(`systemctl openvpn@*`)
            await ssh.exec(`iptables -F`)
            await ssh.exec(`iptables -t nat -F`)
            return true
        } catch(e) {
            console.error(e)
            return false
        } finally {
            await ssh.close()
        }
    }

    /**
     * From inside docker container, find host ip for ssh
     */
    protected async findHostIP(): Promise<string> {
        const ip = 
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