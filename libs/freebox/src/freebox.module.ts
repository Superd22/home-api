import { TypeOrmModule } from '@nestjs/typeorm';
import { FreeboxVPNAPI } from './api/vpn.api.service';
import { FreeboxResolver } from './resolvers/freebox.resolver';
import { Module, HttpModule } from '@nestjs/common';
import { FreeboxService } from './freebox.service';
import { NordvpnModule } from '@homeapi/nordvpn'
import { FreeboxToken } from './entities/freebox-token.entity';
import { FreeboxAuthAPI } from './api/auth.api.service';
import { PubsubModule } from '@homeapi/pubsub';

@Module({
    imports: [
        HttpModule,
        PubsubModule,
        NordvpnModule,
        // TypeOrmModule.forFeature([FreeboxToken])
    ],
    providers: [
        FreeboxService,
        FreeboxVPNAPI,
        FreeboxResolver,
        FreeboxAuthAPI,
    ],
    exports: [
        FreeboxService,
    ],
})
export class FreeboxModule {}
