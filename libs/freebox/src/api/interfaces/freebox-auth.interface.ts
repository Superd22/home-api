
export interface AuthorizeResponse {
    app_token: string;
    track_id:  number;
}
export interface AuthorizeTokenResponse {
    status: string;
    challenge:  string;
}

export interface GetChallenge {
    logged_in: boolean;
    challenge:  string;
}

export interface SessionToken {
    session_token: string;
    challenge:  string;
    permissions: {[permissionName: string]: boolean}
}



export enum TokenStatus {
    pending = "pending",
    timeout = "timeout",
    granted = "granted",
    denied = "denied"
}