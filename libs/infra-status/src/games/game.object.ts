import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Service, Task } from 'dockerode'
@ObjectType('Game')
export class GQLGame {

  @Field(() => ID)
  public readonly id: string

  @Field(() => String)
  public readonly name: string

  public tasks: Task[]

  public constructor(public readonly service: Service) {
    this.id = service.ID
    this.name = service.Spec.Labels['game.name']
  }

}
