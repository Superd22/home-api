import { HttpService } from '@nestjs/axios'
import { Logger } from '@nestjs/common'
import { catchError, defer, firstValueFrom, lastValueFrom, map, mergeMap, Observable, of, retry, retryWhen, throwError } from 'rxjs'
import { FreeboxAuthAPI } from './auth.api.service'
import { FreeboxResponse } from './interfaces/freebox-return.interface'

export abstract class FreeboxHttpApi {

  protected abstract http: HttpService
  protected abstract auth: FreeboxAuthAPI

  protected readonly api: string = "http://mafreebox.freebox.fr/api/v8/"
  protected readonly logger: Logger = new Logger('Freebox')

  protected async get<T = any>(endpoint: string): Promise<FreeboxResponse<T>> {
    return this.buildCall<T>('get', endpoint)
  }

  protected async post<T = any>(endpoint: string, data: any): Promise<FreeboxResponse<T>> {
    return this.buildCall<T>('post', endpoint, data)
  }

  protected buildCall<T = any>(method: 'get' | 'post', endpoint: string, data?: any): Promise<FreeboxResponse<T>> {
    return firstValueFrom(
      defer(() => {
        const options = {
          headers: this.headers()
        }
        const args = data ? [data, options] : [options]
        return this.http[method]<FreeboxResponse<T>>(
          this.api + endpoint,
          ...args
        ).pipe(
          map((data) => data.data)
        )
      }
      ).pipe(
        retry({ delay: this.needReauth() }),
        catchError((error) => {
          if (error.response.status === 403) {
            this.logger.error('Got a 403 error', error)
          }

          return throwError(() => new class FreeboxAuthError extends Error { }())
        })
      )
    ) as Promise<FreeboxResponse<T>>
  }

  protected needReauth() {
    return async (error: any, retryCount: number) => {
      if (retryCount > 1) throw error
      if (error.response.status === 403) {
        this.logger.debug(`Got a 403, trying to refresh token`)
        await this.auth.getSession()
        return true // retry
      }
    }
  }

  protected headers(): Record<string, string> {
    return {
      "X-Fbx-App-Auth": this.auth.sessionToken
    }
  }
}