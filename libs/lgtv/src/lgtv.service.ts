import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { PubsubService, VPNStartingEvent, VPNStartedEvent } from '@homeapi/pubsub'
import { default as lgtv } from 'lgtv2'

@Injectable()
export class LgtvService implements OnModuleInit {

    protected readonly logger: Logger = new Logger('LGTVService')

    protected readonly lgtv: lgtv

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

    public async onModuleInit() {
        this.pubsub.subscribe(VPNStartingEvent)
            .subscribe(
                event => this.toast({ message: `Connecting to VPN ${event.vpnRegion}`  })
            )

        this.pubsub.subscribe(VPNStartedEvent)
            .subscribe(
                event => this.toast({ message: `Connected to VPN ${event.vpnName}!`  })
            )
    }

    public async toast(toast: LGTVToast): Promise<void> {
        return new Promise((resolve, reject) => this.lgtv.request('ssap://system.notifications/createToast', toast, (err, res) => {
            if(err) reject(err)
            else resolve(res)
        }));
    }

}

export interface LGTVToast {
    message: string
}
