import { Module, HttpModule } from '@nestjs/common'
import { NordvpnService } from './nordvpn.service'
import { NordvpnResolver } from './nordvpn.resolver'

@Module({
    imports: [HttpModule],
    providers: [NordvpnService, NordvpnResolver],
    exports: [NordvpnService],
})
export class NordvpnModule { }
