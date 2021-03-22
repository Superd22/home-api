import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { PubsubService, VPNStartingEvent, VPNStartedEvent } from '@homeapi/pubsub'
import { default as lgtv } from 'lgtv2'
import * as wol from "wol"

@Injectable()
export class LgtvService implements OnModuleInit {

    protected readonly logger: Logger = new Logger('LGTVService')

    public readonly lgtv: lgtv

    /** @todo fetch this */
    protected readonly macAddress = "A8:23:FE:CA:87:84"

    constructor(
        protected readonly pubsub: PubsubService
    ) {
        this.lgtv = lgtv({ url: 'ws://192.168.1.34:3000' })

        this.lgtv.on('connect', () => {
            this.logger.log(`Connected to TV`)
        })

        this.lgtv.on('error', err => {
            this.logger.error(`Error : ${err.message}`)
        })
    }

    /**
     * Try and turn on the TV with WOL
     */
    public async turnOn(): Promise<void> {
        console.log('Turning on');
        return new Promise((resolve, reject) => {
          wol.wake(this.macAddress, {
            address: '192.168.1.34',
            port: 3000
          }, (error) => {
            if (error) return reject(error);
            console.log('Turned on');
            resolve();
          });
        });
    }

    public async onModuleInit(): Promise<void> {
        this.pubsub.subscribe(VPNStartingEvent)
            .subscribe(
                event => this.toast({ message: `Connecting to VPN ${event.vpnRegion}` })
            )

        this.pubsub.subscribe(VPNStartedEvent)
            .subscribe(
                event => this.toast({ message: `Connected to VPN ${event.vpnName}!` })
            )
    }

    public async toast(toast: LGTVToast): Promise<void> {
        return new Promise((resolve, reject) => this.lgtv.request('ssap://system.notifications/createToast', toast, (err, res) => {
            if (err) reject(err)
            else resolve(res)
        }));
    }

    public async getAppState(appId: string): Promise<AppState | undefined> {
        return new Promise((resolve, reject) => 
            this.lgtv.request('ssap://system.launcher/getAppState', { id: appId }, (err, res) => { if(err) reject(err); resolve(res) })
        )
    }

}

export interface LGTVToast {
    message: string
}

export interface AppState {
    void: string
}
