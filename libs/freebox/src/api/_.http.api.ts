import { HttpService } from '@nestjs/axios'
import { Logger } from '@nestjs/common'
import { firstValueFrom, map } from 'rxjs'
import { FreeboxAuthAPI } from './auth.api.service'
import { FreeboxResponse } from './interfaces/freebox-return.interface'

export abstract class FreeboxHttpApi {

  protected abstract http: HttpService
  protected abstract auth: FreeboxAuthAPI

  protected readonly api: string = "http://mafreebox.freebox.fr/api/v8/"
  protected readonly logger: Logger = new Logger('Freebox')

  protected async get<T = any>(endpoint: string): Promise<FreeboxResponse<T>> {
    return firstValueFrom(
      this.http.get<FreeboxResponse<T>>(
        this.api + endpoint,
        {
          headers: this.headers()
        }
      ).pipe(
        map((data) => data.data)
      )
    )
  }

  protected async post<T = any>(endpoint: string, data: any): Promise<FreeboxResponse<T>> {
    return firstValueFrom(
      this.http.post<FreeboxResponse<T>>(
        this.api + endpoint,
        data,
        {
          headers: this.headers()
        }
      ).pipe(
        map((data) => data.data)
      )
    ) as Promise<FreeboxResponse<T>>
  }

  protected headers(): Record<string, string> {
    return {
      "X-Fbx-App-Auth": this.auth.sessionToken
    }
  }
}