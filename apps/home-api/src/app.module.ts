import { LgtvModule } from './../../../libs/lgtv/src/lgtv.module';
import { Module } from '@nestjs/common';
import { AppResolver } from './app.resolver';
import { FreeboxModule } from '@homeapi/freebox';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubsubModule } from '@homeapi/pubsub';
import { NordvpnModule } from '@homeapi/nordvpn';

@Module({
    imports: [
        GraphQLModule.forRoot({
            autoSchemaFile: true,
            installSubscriptionHandlers: true,
        }),
        // TypeOrmModule.forRoot({
        //     type: 'sqlite',
        //     database: ":memory:",
        //     synchronize: true,
        //     autoLoadEntities: true,
        // }),
        FreeboxModule,
        PubsubModule,
        NordvpnModule,
        LgtvModule,
    ],
    providers: [AppResolver],
})
export class AppModule { }
