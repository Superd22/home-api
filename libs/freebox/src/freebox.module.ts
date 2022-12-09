import { TypeOrmModule } from '@nestjs/typeorm';
import { FreeboxVPNAPI } from './api/vpn.api.service';
import { FreeboxResolver } from './resolvers/freebox.resolver';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FreeboxService } from './freebox.service';
import { NordvpnModule } from '@homeapi/nordvpn'
import { FreeboxToken } from './entities/freebox-token.entity';
import { FreeboxAuthAPI } from './api/auth.api.service';
import { PubsubModule } from '@homeapi/pubsub';
import { FreeboxLanApi } from './api/lan.api.service';
import { WOLResolver } from './resolvers/wol.resolver';
import { WakeNode } from './resolvers/wake-up-node.resolver';
import { ConfigService } from './config.service.encrypted';

const resolvers = [
    FreeboxResolver,
    WOLResolver,
    WakeNode,
]

@Module({
    imports: [
        HttpModule,
        PubsubModule,
        NordvpnModule,
        TypeOrmModule.forFeature([FreeboxToken])
    ],
    providers: [
        FreeboxService,
        FreeboxVPNAPI,
        FreeboxAuthAPI,
        FreeboxLanApi,
        ConfigService,
        ...resolvers,
    ],
    exports: [
        FreeboxService,
    ],
})
export class FreeboxModule {}
