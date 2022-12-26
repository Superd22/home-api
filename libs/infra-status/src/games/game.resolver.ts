import { Args, Field, ID, Mutation, ObjectType, Query, registerEnumType, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { InfraService } from "../api/infra.service";
import { GQLGame } from './game.object'
import { Service } from 'dockerode'
import { HttpService } from "@nestjs/axios";
import { firstValueFrom, map } from "rxjs";
import { SteamGameSearchResult } from "../api/steam";
import { ListGamesQuery } from "./list-game.query";
import { GQLNode } from "../nodes/node.object";
import { DockerNode } from "../api/node.docker"
import { Scope, Scopes } from "@homeapi/auth";

enum GameStatus {
  OFFLINE,
  STARTING,
  ONLINE
}

registerEnumType(GameStatus, { name: 'GameStatus' })

@ObjectType()
export class ToggleGameServer {
  @Field()
  public readonly success: boolean

  @Field(() => GQLGame)
  public readonly game: GQLGame

}

@Resolver(() => GQLGame)
export class GameResolver {

  constructor(
    protected readonly infra: InfraService,
    protected readonly http: HttpService,
    protected readonly getGames: ListGamesQuery,
  ) { }

  @Query(() => [GQLGame])
  public async games() {
    return (await this.getGames.query()).map(g => new GQLGame(g))
  }

  @ResolveField(() => GQLNode, { nullable: true })
  public async node(
    @Root() game: GQLGame
  ): Promise<GQLNode> {

    const hostname = game.service.Spec.TaskTemplate.Placement.Constraints && game.service.Spec.TaskTemplate.Placement.Constraints[0]
    if (!hostname) return null

    const [host]: DockerNode[] = await this.infra.docker.listNodes({
      filters: {
        name: [
          hostname.replace(/node\.hostname == /i, '')
        ]
      }
    })

    if (host) return new GQLNode(host)
  }


  @ResolveField(() => Boolean)
  public async online(
    @Root() game: GQLGame,
  ): Promise<boolean> {
    if (!game.tasks) game.tasks = await this.infra.docker.listTasks({
      filters: {
        service: [game.service.Spec.Name],
        "desired-state": ["running"]
      }
    })

    // might break if container has healtcheck, check later.
    return game.tasks.some(t => t['Status']['State'] === 'running')
  }


  @ResolveField(() => GameStatus)
  public async status(
    @Root() game: GQLGame
  ): Promise<GameStatus> {
    if (await this.online(game)) return GameStatus.ONLINE
    if (game.tasks?.length > 0) return GameStatus.STARTING
    return GameStatus.OFFLINE
  }

  @ResolveField(() => String, { nullable: true })
  public async image(
    @Root() game: GQLGame
  ) {
    const steamapi = await firstValueFrom(
      this.http.get<SteamGameSearchResult[]>(`https://steamcommunity.com/actions/SearchApps/${game.name}`).pipe(
        map(data => data.data)
      )
    )

    if (!steamapi[0]) return
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamapi[0].appid}/hero_capsule.jpg`
  }


  @Mutation(() => ToggleGameServer)
  @Scopes(Scope.InfraManager)
  public async turnOffServer(@Args('gameId', { type: () => ID }) id: string): Promise<ToggleGameServer> {
    const service: Service = await this.infra.docker.getService(id).inspect()

    await this.infra.docker.getService(id).update({
      version: service.Version.Index,
      ...service.Spec,
      Mode: { Replicated: { Replicas: 0 } }
    })
    return { success: true, game: await this.gameById(id) }
  }

  @Mutation(() => ToggleGameServer)
  @Scopes(Scope.InfraManager)
  public async turnOnServer(@Args('gameId', { type: () => ID }) id: string): Promise<ToggleGameServer> {
    const service: Service = await this.infra.docker.getService(id).inspect()

    await this.infra.docker.getService(id).update({
      version: service.Version.Index,
      ...service.Spec,
      Mode: { Replicated: { Replicas: 1 } }
    })
    return { success: true, game: await this.gameById(id) }
  }

  protected async gameById(id: string): Promise<GQLGame> {
    const games = await this.getGames.query()

    return games.map(g => new GQLGame(g)).find(
      g => g.id === id
    )
  }

}