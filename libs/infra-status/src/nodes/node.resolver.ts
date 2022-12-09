import { Query, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { InfraService } from "../api/infra.service";
import {GQLNode} from './node.object'
import { DockerNode } from "../api/node.docker";
import { GQLGame } from "../games/game.object";
import { ListGamesQuery } from "../games/list-game.query";

@Resolver(() => GQLNode)
export class NodeResolver {

  constructor(
    protected readonly infra: InfraService,
    protected readonly getGames: ListGamesQuery,
  ) {}

  @Query(() => [GQLNode])
  public async nodes() {
    console.log("nodes")
    const nodes: DockerNode[] = await this.infra.docker.listNodes()
    console.log("done nodes")
    return nodes.map(node => new GQLNode(node))
  }

  @ResolveField(() => [GQLGame])
  public async games(
    @Root() node: GQLNode
  ): Promise<GQLGame[]> {
    console.log("listing")
    const games = await this.getGames.query()

    return games
      .filter(s =>
        s.Spec.TaskTemplate.Placement.Constraints == undefined ||
        s.Spec.TaskTemplate.Placement.Constraints[0].toLowerCase().includes(
          node.name.toLowerCase()
        )
      ).map(
        s => new GQLGame(s)
      )

  }

}