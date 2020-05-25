import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class Nordvpn {

    @Field()
    serverName: string

    @Field()
    region: string

}
