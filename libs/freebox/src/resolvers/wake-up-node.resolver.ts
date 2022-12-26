import { Args, Field, ID, Mutation, ObjectType, registerEnumType, Resolver } from "@nestjs/graphql";
import { FreeboxLanApi } from "../api/lan.api.service";
import { ConfigService } from "../config.service.encrypted";

@ObjectType()
export class WakeResult {

  constructor (self: Partial<WakeResult>) {
    Object.assign(this, self)
  }

  @Field()
  success: boolean

  @Field({ description: 'Wether or not the node is currently active.' })
  active: boolean = false

  @Field({ nullable: true })
  error?: string

}

export enum WakableNodes {
  Desktop = "Desktop"
}

registerEnumType(WakableNodes, { name: 'WakableNodes' })

@Resolver()
export class WakeNode {


  constructor(
    protected readonly lan: FreeboxLanApi,
    protected readonly config: ConfigService
  ) { }

  @Mutation(() => WakeResult)
  public async wakeNode(@Args("id", { type: () => WakableNodes }) id: WakableNodes): Promise<WakeResult> {
    const mac = this.config.macs[id]

    if (!mac) return new WakeResult({
      success: false,
      error: "Node not supported"
    })

    console.log("pre")
    const hosts = await this.lan.hosts()
    const host = hosts.result.find(h => h.l2ident.id.toLowerCase() === mac.toLowerCase())

    if (!host) return new WakeResult({
      success: false,
      error: "Infrastructure error..."
    })
    
    const wol = await this.lan.wol(mac)

    if (wol.success) return new WakeResult({
      success: true,
      active: false
    })

    return new WakeResult({
      success: false,
      active: false
    })
  }
}

