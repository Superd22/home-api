import { FreeboxAuthAPI } from "./auth.api.service";
import { FreeboxHttpApi } from "./_.http.api";
import { HttpService } from '@nestjs/axios'
import { LANHost } from "./interfaces/freebox-lan.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FreeboxLanApi extends FreeboxHttpApi {

  constructor(
    protected readonly http: HttpService,
    protected readonly auth: FreeboxAuthAPI,
  ) {
    super();
  }

  public async hosts() {
    return this.get<LANHost[]>('lan/browser/pub/')
  }

  public async wol(mac: string, password?: string) {
    return this.post<never>('lan/wol/pub/', { mac, password })
  }

}