import { Injectable, Scope } from "@nestjs/common";
import Dataloader from 'dataloader'
import { InfraService } from "../api/infra.service";


@Injectable({
  scope: Scope.REQUEST
})
export class ListGamesQuery {

  protected readonly dataloader = new Dataloader(async (keys) => {
    const data = await this.execute()

    return keys.map(k => data)
  })

  constructor(
    protected readonly infra: InfraService
  ) { }

  public async query() {
    return this.dataloader.load({})
  }

  protected async execute() {
    const services = await this.infra.docker.listServices()

    return services.filter(service =>
      !!service.Spec.Labels['game.name']
    )
  }
}