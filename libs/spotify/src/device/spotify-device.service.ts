import { Injectable, HttpService } from "@nestjs/common"
import Spotify from "./spotify";
import { default as puppeteer } from 'puppeteer-core'
import { default as Ws } from 'ws'
import { LgtvService } from "@homeapi/lgtv";
declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void | null
        Spotify: typeof Spotify;
    }
}
/**
 * Creates a fake virtual spotify device to cast to
 */
@Injectable()
export class SpotifyDevice {

    /** @todo fetch this */
    protected readonly token: string = "BQDbo9MIeX1LLopi5rmbhEOXjHkweYqfz9DWbVql7VtX61naOQdkgHvh62BMQTj8PrtE-QjTgWQWPNjvxE9S8IaH6Yxx9dn9ajCNLUiWELfog5PVgMXNVxV0-ugaDkV5RCiqUAPjDfR5DpAtb7HZSUFd8tVRZUARs2alneKkhogulDTX_yUwbGBq-xw";

    protected connectionId: string

    /** @todo figure how to un-hardcode this */
    protected deviceId = "37aabf8ce43c17251c8518cc59a3f1db6e084c65"

    constructor(
        protected readonly http: HttpService,
        protected readonly lgtv: LgtvService
    ) { }

    public async init(): Promise<void> {
        const { dealer: [dealerUrl] } = await this.getSpClientDealer()
        const wss = new Ws(`wss://${dealerUrl}?access_token=${this.token}`)

        wss.on('open', () => console.log('WS open'))
        wss.on('message', this.messageHandler.bind(this))
    }

    protected async messageHandler(data: Ws.Data): Promise<void> {
        const object: SpotifyMessage = JSON.parse((data as string))

        if (object.headers?.['Spotify-Connection-Id']) {
            this.connectionId = object.headers?.['Spotify-Connection-Id']
            await this.postDevice(this.connectionId)
        } else if(object.headers?.['content-type']) {
            // We assuming we're getting commands
            if (object.payloads[0].state_ref) {
                // the user wants to do something to us, redirect to T.V
                console.log("TRYING TO DO SOMETHING, redirecting to TV")
            } else {
                // user disconnected, do nuffin.
                console.log("DISCONNECTED")
            }
        }
    }

    protected async ensureTVDeviceIsUp() {
        const appState = await new Promise((resolve, reject) => 
            this.lgtv.lgtv.request('ssap://system.launcher/getAppState', { id: "spotify-beehive" }, (err, res) => { if(err) reject(err); resolve(res) })
        )
    }

    protected async postDevice(connection_id: string): Promise<void> {
        const post = {
            "device": {
                /** @todo figure this out */
                "device_id": this.deviceId,
                "device_type": "computer",
                "brand": "public_js-sdk",
                "model": "harmony-chrome.86-windows",
                "name": "Home Entertainment",
                "metadata": {},
                "capabilities": {
                    "change_volume": true,
                    "audio_podcasts": true,
                    "enable_play_token": true,
                    "play_token_lost_behavior": "pause",
                    "disable_connect": false,
                    "manifest_formats": ["file_urls_mp3", "file_urls_external", "file_ids_mp4", "file_ids_mp4_dual"]
                }
            },
            connection_id,
            "client_version": "harmony:3.19.1-441cc8f",
            "previous_session_state": null,
            "volume": 65535
        }

        const res = await this.http.post<{device_keep_alive_update_seconds: number, endsongs: null, file_format_filter: number, initial_seq_num: number}>
            (`https://api.spotify.com/v1/track-playback/v1/devices`, post, { headers: { authorization: `Bearer ${this.token}` } })
            .toPromise()
        
        console.log("Device succcesfully registered")
    }

    protected async getSpClientDealer(): Promise<{ spclient: string[], dealer: string[] }> {
        const res = await this.http.get<{ spclient: string[], dealer: string[] }>(`https://apresolve.spotify.com/?type=dealer&type=spclient`).toPromise()
        return res.data
    }

}

export type SpotifyMessage = SpotifyMessageInit | SpotifyMessageState

export type SpotifyMessageInit = SpotifyWS<{ "Spotify-Connection-Id": string }, undefined>

export type SpotifyMessageState = SpotifyWS<{ "content-type": "application/json" }, State[]>

export interface SpotifyWS<Headers = any, Payloads = any> {
    type: "message",
    uri: string,
    headers: Headers,
    payloads: Payloads
}



    export interface Author {
        name: string;
        uri: string;
    }

    export interface Image {
        url: string;
        height: number;
        width: number;
    }

    export interface Metadata {
        uri: string;
        linked_from_uri?: any;
        context_description: string;
        context_uri: string;
        name: string;
        group_name: string;
        group_uri: string;
        authors: Author[];
        duration: number;
        images: Image[];
    }

    export interface FileIdsMp4Dual {
        bitrate: number;
        file_id: string;
        file_url?: any;
        impression_urls?: any;
        track_type: string;
        format: string;
        audio_quality: string;
    }

    export interface FileIdsMp4 {
        bitrate: number;
        file_id: string;
        file_url?: any;
        impression_urls?: any;
        track_type: string;
        format: string;
        audio_quality: string;
    }

    export interface Manifest {
        file_ids_mp4_dual: FileIdsMp4Dual[];
        file_ids_mp4: FileIdsMp4[];
    }

    export interface Track {
        metadata: Metadata;
        manifest: Manifest;
        track_type: string;
        ms_played_until_update: number;
        ms_playing_update_interval: number;
        content_type: string;
    }

    export interface SkipNext {
        state_index: number;
        paused: boolean;
        active_alias?: any;
    }

    export interface SkipPrev {
        state_index: number;
        paused: boolean;
        active_alias?: any;
    }

    export interface ShowNext {
        state_index: number;
        paused: boolean;
        active_alias?: any;
    }

    export interface ShowPrev {
        state_index: number;
        paused: boolean;
        active_alias?: any;
    }

    export interface Advance {
        state_index: number;
        paused: boolean;
        active_alias?: any;
    }

    export interface Transitions {
        skip_next: SkipNext;
        skip_prev: SkipPrev;
        show_next: ShowNext;
        show_prev: ShowPrev;
        advance: Advance;
    }

    export interface Restrictions {
        disallow_pausing_reasons: string[];
    }

    export interface State {
        state_id: string;
        disallow_seeking: boolean;
        track: number;
        track_uid: string;
        initial_playback_position?: any;
        transitions: Transitions;
        player_cookie: string;
        restrictions: Restrictions;
    }

    export interface Options {
        shuffling_context: boolean;
        repeating_context: boolean;
        repeating_track: boolean;
    }

    export interface Attributes {
        options: Options;
        playback_session_id: string;
    }

    export interface StateMachine {
        state_machine_id: string;
        tracks: Track[];
        states: State[];
        attributes: Attributes;
    }

    export interface StateRef {
        state_index: number;
        paused: boolean;
        active_alias?: any;
    }

    export interface State {
        type: string;
        selected_alias_id?: any;
        prev_state_ref?: any;
        state_machine: StateMachine;
        state_ref?: StateRef;
        seek_to: number;
        registration_token: string;
    }


