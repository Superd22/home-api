import { FreeboxAuthAPI } from './../api/auth.api.service';
import { Resolver, Mutation, registerEnumType, Args } from "@nestjs/graphql";
import { NordvpnService, NordVPNRegion } from "@homeapi/nordvpn";

registerEnumType(NordVPNRegion, {
    name: 'VPNRegion',
});

@Resolver()
export class FreeboxResolver {

    constructor(
        protected readonly nordvpn: NordvpnService,
        protected readonly authApi: FreeboxAuthAPI
    ) {}

    // @Mutation(() => String)
    // public async connectVPN(
    //     @Args('region', { type: () => NordVPNRegion }) region: NordVPNRegion
    // ): Promise<string> {
    //     return this.nordvpn.fetchBestServerForRegion(region)
    // }

    // @Mutation(() => String)
    // public async disconnectVPN() {

    // }

}