import { ApiObject, ApiObjectProps } from "cdk8s";
import { Construct } from "constructs";

export interface IngressRouteProps {
    /** metadata name for this route */
    name: string
    entryPoints: string[]
    tls?: {
        certResolver?: string
    },
    routes: {
        match: string,
        kind: string,
        services: {
            name: string,
            kind?: string
            port?: number
        }[]
    }[]
}

export class IngressRoute extends ApiObject {
    constructor(
        scope: Construct,
        id: string,
        props: IngressRouteProps
    ) {
        super(scope, id, {
            apiVersion: 'traefik.containo.us/v1alpha1',
            kind: 'IngressRoute',
            metadata: {
                name: props.name
            },
            spec: {
                tls: props.tls,
                entryPoints: props.entryPoints,
                routes: props.routes
            }
        })
    }
}
