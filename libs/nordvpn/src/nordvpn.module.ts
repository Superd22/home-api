import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { NordvpnService } from './nordvpn.service'
import { NordvpnResolver } from './nordvpn.resolver'

@Module({
    imports: [HttpModule],
    providers: [NordvpnService, NordvpnResolver],
    exports: [NordvpnService],
})
export class NordvpnModule { }
