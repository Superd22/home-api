import { Injectable, Logger } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { PubSubEvent, PubSubEvents, BaseEvent } from './events'
import { Observable } from 'rxjs'

@Injectable()
export class PubsubService {
    /** main pubsub for all our app */
    protected static pubsub: PubSub

    protected logger: Logger = new Logger('PUBSUB')

    /** main pubsub for the api */
    public get pubsub() { return PubsubService.pubsub }

    constructor() {
        if (!this.pubsub) PubsubService.pubsub = new PubSub()
    }

    public async emit<T extends PubSubEvent>(event: T): Promise<void> {
        this.logger.log(`emitting event ${event.event}`)
        return this.pubsub.publish(event.event, event)
    }

    public subscribe<T extends BaseEvent>(event: new() => T): Observable<T> {
        return new Observable((sub) => {
            this.pubsub.subscribe((new event() as any).event, (event) => {
                sub.next(event)
            })
        })
    }


}
