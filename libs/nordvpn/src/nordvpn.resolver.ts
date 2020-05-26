import { Resolver, Mutation, Args } from '@nestjs/graphql'
import { Nordvpn } from './nordvpn.object'
import { NordVPNRegion, NordvpnService } from './nordvpn.service'

@Resolver('Nordvpn')
export class NordvpnResolver {

    constructor(
        protected readonly nordvpnService: NordvpnService
    ) {}

    // public async disconnect(): Promise<void> {
        
        // }
        
    @Mutation(() => Nordvpn)
    public async connectVPN(
        @Args('region', { type: () => NordVPNRegion }) region: NordVPNRegion
    ): Promise<Nordvpn> {

        const bestServer = await this.nordvpnService.fetchBestServerForRegion(region)
        const serverConfig = await this.nordvpnService.setupVPNConf(bestServer)

        return { region: 'fr', serverName: bestServer }
    }

}
