import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { FreeboxToken } from "../entities/freebox-token.entity";
import { FreeboxResponse } from "./interfaces/freebox-return.interface";
import { PubsubService } from "@homeapi/pubsub";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorizeResponse, AuthorizeTokenResponse, GetChallenge, SessionToken, TokenStatus } from "./interfaces/freebox-auth.interface";
import { HttpService } from '@nestjs/axios'
import * as os from "os"
import { firstValueFrom } from "rxjs";

@Injectable()
export class FreeboxAuthAPI implements OnApplicationBootstrap {

    protected readonly api: string = "http://mafreebox.freebox.fr/api/v8/"
    protected readonly logger: Logger = new Logger('Freebox')

    public readonly sessionToken: string


    constructor(
        protected readonly http: HttpService,
        protected readonly pubsub: PubsubService,
        @InjectRepository(FreeboxToken) protected token: Repository<FreeboxToken>,
    ) { }

    public async onApplicationBootstrap() {
        return this.getSession()
    }


    public async getSession(): Promise<void> {
        const token = await this.getWorkingAppToken()

        this.logger.debug("Getting session token")
        const { data } = await firstValueFrom(this.http.post<FreeboxResponse<SessionToken>>(
            this.api + `login/session`,
            {
                app_id: this.getAppId().app_id,
                password: token.password
            }
        ))

        if (!data.success) throw new Error(`Could not get session token`);
        (this as any).sessionToken = data.result.session_token
        this.logger.debug("Sucesfully got session token")
    }

    /** 
     * get a new app token from the freebox
     */
    public async getWorkingAppToken(): Promise<FreeboxToken> {
        let token = await this.token.findOne({ where: { status: TokenStatus.granted } })

        if (token) {
            this.logger.debug("Found AppToken")
            await this.updateChallenge(token)

            return token;
        }

        this.logger.debug(`Couldn't find AppToken, fetching one.`)
        // Otherwise try and fetch one
        const { data } = await this.http.post<FreeboxResponse<AuthorizeResponse>>(this.api + 'login/authorize', this.getAppId()).toPromise()
        this.logger.debug(`Fetched app-token from freebox.`)
        token = await this.token.save({
            appToken: data.result.app_token,
            status: TokenStatus.pending as TokenStatus,
            trackId: data.result.track_id,
        })



        while (token.status !== TokenStatus.granted) {
            this.logger.debug(`Checking token status`)
            const check = await this.checkTokenStatus(token)
            token.status = check.status
            token.challenge = check.challenge
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }


        this.logger.debug(`Token was validated!`)
        return this.token.save(token)
    }

    protected async checkTokenStatus(token: FreeboxToken): Promise<{ status: TokenStatus, challenge?: string }> {
        const { data } = await firstValueFrom(this.http.get<FreeboxResponse<AuthorizeTokenResponse>>(
            this.api + `login/authorize/${token.trackId}`
        ))

        return { status: data.result.status as TokenStatus, challenge: data.result.challenge }
    }

    protected async updateChallenge(token: FreeboxToken): Promise<FreeboxToken> {
        this.logger.debug("Refreshing token challenge")
        const { data } = await firstValueFrom(this.http.get<FreeboxResponse<GetChallenge>>(
            this.api + `login`
        ))

        token.challenge = data.result.challenge
        return this.token.save(token)
    }

    /**
     * returns id packet of the current app
     */
    protected getAppId() {
        // eslint-disable-next-line @typescript-eslint/camelcase
        return { app_id: "david.homeapi.fr", app_name: "Home API", app_version: require('../../../../package.json').version, device_name: os.hostname() }
    }
}