import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

export interface IngressRouteTCPProps {
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

export class IngressRouteTCP extends ApiObject {
    constructor(
        scope: Construct,
        id: string,
        props: IngressRouteTCPProps
    ) {
        super(scope, id, {
            apiVersion: 'traefik.containo.us/v1alpha1',
            kind: 'IngressRouteTCP',
            spec: {
                entryPoints: props.entryPoints,
                routes: props.routes.map((route) => ({
                    match: 'HostSNI(`*`)',
                    kind: 'Rule',
                    services: route.services
                }))
            }
        })
    }
}
