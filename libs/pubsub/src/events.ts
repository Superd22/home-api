export type PubSubEvent = 
| VPNStartingEvent 
| VPNStartedEvent
| VPNDisconnectedEvent



export enum PubSubEvents {
    VPNStarting='VPNStarting',
    VPNStarted='VPNStarted',
    VPNDisconnectedEvent='VPNDisconnectedEvent',
}

export class BaseEvent {
    public static event: PubSubEvents
}

export class VPNStartingEvent extends BaseEvent {
    public event: PubSubEvents.VPNStarting = PubSubEvents.VPNStarting

    vpnName: string
    vpnRegion: string
}

export class VPNStartedEvent extends BaseEvent {
    public event: PubSubEvents.VPNStarted = PubSubEvents.VPNStarted

    vpnName: string
    vpnRegion: string
}

export class VPNDisconnectedEvent extends BaseEvent {
    public event: PubSubEvents.VPNDisconnectedEvent = PubSubEvents.VPNDisconnectedEvent
}
