import { Logger } from "@nestjs/common";
import { Args, Field, ID, Mutation, ObjectType, registerEnumType, Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FreeboxLanApi } from "../api/lan.api.service";
import { ConfigService } from "../config.service.encrypted";
import { NodeEntity } from '../entities/node.entity'

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

  protected readonly logger = new Logger('WakeNode')

  constructor(
    protected readonly lan: FreeboxLanApi,
    protected readonly config: ConfigService,
    @InjectRepository(NodeEntity)
    protected readonly nodeRepository: Repository<NodeEntity>
  ) { }

  @Mutation(() => WakeResult)
  public async wakeNode(@Args("id", { type: () => WakableNodes }) id: WakableNodes): Promise<WakeResult> {
    const mac = this.config.macs[id]

    if (!mac) return new WakeResult({
      success: false,
      error: "Node not supported"
    })

    const hosts = await this.lan.hosts()
    const host = hosts.result.find(h => h.l2ident.id.toLowerCase() === mac.toLowerCase())

    if (!host) return new WakeResult({
      success: false,
      error: "Infrastructure error..."
    })

    
    const node = await this.nodeRepository.findOneBy({id})

    if (!node?.lastTriggeredUp || node.lastTriggeredUp.getTime() < new Date().getTime()-10000) {
      this.logger.debug("Triggering WOL")
      const wol = await this.lan.wol(mac)
      await this.nodeRepository.upsert({ id, lastTriggeredUp: new Date() }, ['id'])

      if (wol.success) return new WakeResult({
        success: true,
        active: false
      })
    }
    

    return new WakeResult({
      success: false,
      active: false
    })
  }
}

