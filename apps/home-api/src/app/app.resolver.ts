import { Resolver, Query } from "@nestjs/graphql";

@Resolver()
export class AppResolver {

    @Query(() => String)
    version(): string {
        return "1.0.0"
    }

}
