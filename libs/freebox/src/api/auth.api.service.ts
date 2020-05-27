import { Injectable, HttpService, Logger } from "@nestjs/common";
import { FreeboxToken } from "../entities/freebox-token.entity";
import { FreeboxResponse } from "./interfaces/freebox-return.interface";
import { PubsubService } from "@homeapi/pubsub";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorizeResponse, TokenStatus } from "./interfaces/freebox-auth.interface";
import { Observable, pipe, race } from "rxjs";
import * as os from "os"

@Injectable()
export class FreeboxAuthAPI {

    protected readonly api: string = "http://mafreebox.freebox.fr/api/v7/"
    protected readonly logger: Logger = new Logger('Freebox') 


    constructor(
        protected readonly http: HttpService,
        protected readonly pubsub: PubsubService,
        // @InjectRepository(FreeboxToken) protected token: Repository<FreeboxToken>,
    ) {
        // this.getWorkingAppToken()
    }


    /** 
     * get a new app token from the freebox
     */
    public async getWorkingAppToken(): Promise<void> {
        // const existingToken = await this.token.findOne({ where: { status: "granted" } })
        // if (existingToken) return existingToken;

        this.logger.debug(`Couldn't find AppToken, fetching one.`)
        // Otherwise try and fetch one
        const { data } = await this.http.post<FreeboxResponse<AuthorizeResponse>>(this.api + 'login/authorize', this.getAppId()).toPromise()
        if (data && data.success) {
            this.logger.debug(`Fetched app-token from freebox.`)
            console.log(data.result)
            // return this.token.save({
            //     appToken: data.result.app_token,
            //     trackId: data.result.track_id,
            // })
        }
    }


    /**
     * returns id packet of the current app
     */
    protected getAppId() {
        // eslint-disable-next-line @typescript-eslint/camelcase
        return { app_id: "david.homeapi.fr", app_name: "Home API", app_version: require('../../../../package.json').version, device_name: os.hostname() }
    }
}