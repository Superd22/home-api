import { Injectable, HttpService } from '@nestjs/common'
import { registerEnumType } from '@nestjs/graphql'
import * as fs from 'fs'


/**
 * Allows fetching NordVPN api for stats about servers
 */
@Injectable()
export class NordvpnService {
    
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
    public async fetchOVPNConfigForServer(serverName: string): Promise<string> {
        const file = await this.http.get<string>(`https://downloads.nordcdn.com/configs/files/ovpn_legacy/servers/${serverName}.udp1194.ovpn`).toPromise()
        // Ensure that we use our identity
        const ovpnConf = file.data.replace('auth-user-pass', 'auth-user-pass /etc/openvpn/identity')

        await new Promise((resolve, reject) => fs.writeFile(`${__dirname}/../../../volumes/openvpn_clients/${serverName}.conf`, ovpnConf, (err) => {
            if(err) reject(err)
            else resolve()
        }));
        
        return ovpnConf
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