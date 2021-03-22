declare namespace Spotify {
    export class Player {
        constructor(args: PlayerConstructArgs)

        connect(): void

        addListener(event: 'initialization_error', cb: (error: { message: string }) => void): void
        addListener(event: 'authentication_error', cb: (error: { message: string }) => void): void
        addListener(event: 'account_error', cb: (error: { message: string }) => void): void
        addListener(event: 'playback_error', cb: (error: { message: string }) => void): void
        addListener(event: 'player_state_changed', cb: (state: unknown) => void): void
        addListener(event: 'ready', cb: (data: { device_id: string }) => void): void
        addListener(event: 'not_ready', cb: (data: { device_id: string }) => void): void

        isLoaded: Promise<unknown>
    }

    export interface PlayerConstructArgs {
        name: string
        getOAuthToken: (cb: (token: string) => void) => void
    }
}

export default Spotify