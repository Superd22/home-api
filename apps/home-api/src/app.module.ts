import { Module } from '@nestjs/common';
import { AppResolver } from './app.resolver';
import { FreeboxModule } from '@homeapi/freebox';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        GraphQLModule.forRoot({
            autoSchemaFile: true,
            installSubscriptionHandlers: true,
        }),
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ":memory:",
            synchronize: true,
            autoLoadEntities: true,
        }),
        FreeboxModule
    ],
    providers: [AppResolver],
})
export class AppModule { }
