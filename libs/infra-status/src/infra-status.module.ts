import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InfraService } from './api/infra.service';
import { NodeResolver } from './nodes/node.resolver';
import { GameResolver } from './games/game.resolver';
import { ListGamesQuery } from './games/list-game.query';
import { NodeEntity } from '@homeapi/freebox';


const resolvers = [
    NodeResolver,
    GameResolver,
]

const queries = [
    ListGamesQuery
]

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([NodeEntity])
    ],
    providers: [
        InfraService,
        ...queries,
        ...resolvers,
    ],
    exports: [
    ],
})
export class InfraStatusModule { }
