import { LgtvModule } from './../../../libs/lgtv/src/lgtv.module';
import { Module } from '@nestjs/common';
import { AppResolver } from './app.resolver';
import { FreeboxModule } from '@homeapi/freebox';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubsubModule } from '@homeapi/pubsub';
import { NordvpnModule } from '@homeapi/nordvpn';
import { ConfigService } from './config.service.encrypted';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { InfraStatusModule } from '@homeapi/infra-status'
import { AuthModule } from '@homeapi/auth';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,  
            subscriptions: {
                'graphql-ws': true
            },
        }),
        TypeOrmModule.forRoot({
            ...new ConfigService().db,
            synchronize: true,
            autoLoadEntities: true,
        }),
        AuthModule,
        FreeboxModule,
        PubsubModule,
        NordvpnModule,
        LgtvModule,
        InfraStatusModule
    ],
    providers: [AppResolver, ConfigService],
})
export class AppModule { }
