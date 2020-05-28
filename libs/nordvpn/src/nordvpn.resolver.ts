import { Resolver, Mutation, Args } from '@nestjs/graphql'
import { Nordvpn } from './nordvpn.object'
import { NordVPNRegion, NordvpnService } from './nordvpn.service'
import { PubsubService, PubSubEvents } from '@homeapi/pubsub'

@Resolver('Nordvpn')
export class NordvpnResolver {

    constructor(
        protected readonly nordvpnService: NordvpnService,
        protected readonly pubsub: PubsubService,
    ) {}

    // public async disconnect(): Promise<void> {
        
        // }
        
    @Mutation(() => Nordvpn)
    public async connectVPN(
        @Args('region', { type: () => NordVPNRegion }) region: NordVPNRegion
    ): Promise<Nordvpn> {

        const bestServer = await this.nordvpnService.fetchBestServerForRegion(region)
        await this.pubsub.emit({ event: PubSubEvents.VPNStarting, vpnName: bestServer, vpnRegion: region })
        await this.nordvpnService.setupVPNConf(bestServer)
        await this.nordvpnService.openVPNTunnel(bestServer)
        await this.pubsub.emit({ event: PubSubEvents.VPNStarted, vpnName: bestServer, vpnRegion: region })

        return { region: 'fr', serverName: bestServer }
    }

}
