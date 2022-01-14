import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

export interface IngressRouteUDPProps {
    /** metadata name for this route */
    entryPoints?: string[]
    routes: {
        services: {
            name: string,
            port?: number | string
            weight?: number
        }[]
    }[]
}

export class IngressRouteUDP extends ApiObject {
    constructor(
        scope: Construct,
        id: string,
        props: IngressRouteUDPProps
    ) {
        super(scope, id, {
            apiVersion: 'traefik.containo.us/v1alpha1',
            kind: 'IngressRouteUDP',
            spec: {
                entryPoints: props.entryPoints,
                routes: props.routes
            }
        })
    }
}
