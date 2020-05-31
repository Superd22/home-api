export interface RecommendedServer {
    id:           number;
    created_at:   string;
    updated_at:   string;
    name:         string;
    station:      string;
    hostname:     string;
    load:         number;
    status:       Status;
    locations:    Location[];
    technologies: Technology[];
    groups:       Group[];
    ips:          IPElement[];
}

export interface Group {
    id:          number;
    created_at:  string;
    updated_at:  string;
    title:       Title;
    type?:       Group;
    identifier?: Identifier;
}

export enum Identifier {
    LegacyGroupCategory = "legacy_group_category",
    Regions = "regions",
}

export enum Title {
    Amériques = "Amériques",
    LegacyCategory = "Legacy category",
    P2P = "P2P",
    Regions = "Regions",
    VPNStandard = "VPN standard",
}

export interface IPElement {
    id:         number;
    created_at: string;
    updated_at: string;
    server_id:  number;
    ip_id:      number;
    type:       string;
    ip:         IPIP;
}

export interface IPIP {
    id:      number;
    ip:      string;
    version: number;
}

export interface Location {
    id:         number;
    created_at: string;
    updated_at: string;
    latitude:   number;
    longitude:  number;
    country:    Country;
}

export interface Country {
    id:   number;
    name: string;
    code: string;
    city: City;
}

export interface City {
    id:        number;
    name:      string;
    latitude:  number;
    longitude: number;
    dns_name:  string;
    hub_score: number;
}

export enum Status {
    Maintenance = "maintenance",
    Offline = "offline",
    Online = "online",
}

export interface Technology {
    id:         number;
    name:       string;
    identifier: string;
    created_at: string;
    updated_at: string;
    metadata:   Metadatum[];
    pivot:      Pivot;
}

export interface Metadatum {
    name:  string;
    value: string;
}

export interface Pivot {
    status: Status;
}
