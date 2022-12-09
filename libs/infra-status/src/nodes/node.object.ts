import { Field, ID, ObjectType } from "@nestjs/graphql";
import { DockerNode } from "../api/node.docker";

@ObjectType('Node')
export class GQLNode {

  @Field(() => ID)
  public readonly id: string

  @Field(() => String)
  public readonly name: string

  @Field()
  public readonly online: boolean

  public constructor(node: DockerNode) {
    this.id = node.ID
    this.name = node.Description.Hostname
    this.online = node.Status.State === 'ready'
  }

}
