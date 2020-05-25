
export interface AuthorizeResponse {
    app_token: string;
    track_id:  number;
}


export enum TokenStatus {
    unknown = "unknown",
    pending = "pending",
    timeout = "timeout",
    granted = "granted",
    denied = "denied"
}