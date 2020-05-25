import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions'

@Injectable()
export class PubsubService {
    /** main pubsub for all our app */
    protected static pubsub: PubSub

    /** main pubsub for the api */
    public get pubsub() { return PubsubService.pubsub }

    constructor() {
        if (!this.pubsub) PubsubService.pubsub = new PubSub()
    }


}
