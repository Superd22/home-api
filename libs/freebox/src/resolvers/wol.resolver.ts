import { FreeboxAuthAPI } from './../api/auth.api.service';
import { Resolver, Mutation, registerEnumType, Args, Query } from "@nestjs/graphql";
import { NordvpnService, NordVPNRegion } from "@homeapi/nordvpn";
import { FreeboxLanApi } from '../api/lan.api.service';

@Resolver()
export class WOLResolver {

    constructor(
        protected readonly lan: FreeboxLanApi
    ) {}

    @Query(() => String)
    public async test(): Promise<string> {
        const {result: hosts} = await this.lan.hosts()
        console.log(
            JSON.stringify(
            hosts.filter(h => h.active),
            null,
            4
            )
        )

        return "coucou"
    }

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