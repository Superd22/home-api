import { Query, registerEnumType, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { InfraService } from "../api/infra.service";
import {GQLNode} from './node.object'
import { DockerNode } from "../api/node.docker";
import { GQLGame } from "../games/game.object";
import { ListGamesQuery } from "../games/list-game.query";
import { Repository } from "typeorm";
import { NodeEntity } from "@homeapi/freebox";
import { InjectRepository } from "@nestjs/typeorm";

enum NodeStatus {
  OFFLINE,
  STARTING,
  ONLINE
}

registerEnumType(NodeStatus, { name:'NodeStatus' })

@Resolver(() => GQLNode)
export class NodeResolver {

  constructor(
    protected readonly infra: InfraService,
    protected readonly getGames: ListGamesQuery,
    @InjectRepository(NodeEntity)
    protected readonly nodeRepository: Repository<NodeEntity>
  ) {}

  @Query(() => [GQLNode])
  public async nodes() {
    const nodes: DockerNode[] = await this.infra.docker.listNodes()
    return nodes.map(node => new GQLNode(node))
  }

  @ResolveField(() => NodeStatus)
  public async status(
    @Root() node: GQLNode
  ): Promise<NodeStatus> {
    const dbNode = await this.nodeRepository.findOneBy({id:node.name})
    if (node.online) {
      await this.nodeRepository.upsert({ id: node.name, lastTriggeredUp: null }, ['id'])
      return NodeStatus.ONLINE
    } else {
      if (dbNode?.lastTriggeredUp) return NodeStatus.STARTING
      else return NodeStatus.OFFLINE
    }
  }

  @ResolveField(() => [GQLGame])
  public async games(
    @Root() node: GQLNode
  ): Promise<GQLGame[]> {
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