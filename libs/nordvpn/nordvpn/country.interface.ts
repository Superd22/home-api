export interface NordVPNCountry {
    id:            number;
    name:          string;
    code:          string;
    technologies:  Group[];
    groups:        Group[];
    servers_count: number;
}

export interface Group {
    id:            number;
    name:          Name;
    servers_count: number;
    technologies?: Group[];
    groups?:       Group[];
}

export enum Name {
    DoubleVPN = "Double VPN",
    HTTPCyberSECProxy = "HTTP CyberSec Proxy",
    HTTPCyberSECProxySSL = "HTTP CyberSec Proxy (SSL)",
    HTTPProxy = "HTTP Proxy",
    HTTPProxySSL = "HTTP Proxy (SSL)",
    IKEv2IPSEC = "IKEv2/IPSec",
    IPDédiée = "IP dédiée",
    Obfusqués = "Obfusqués",
    OnionOverVPN = "Onion Over VPN",
    OpenVPNTCP = "OpenVPN TCP",
    OpenVPNTCPDedicated = "OpenVPN TCP Dedicated",
    OpenVPNTCPObfuscated = "OpenVPN TCP Obfuscated",
    OpenVPNUDP = "OpenVPN UDP",
    OpenVPNUDPDedicated = "OpenVPN UDP Dedicated",
    OpenVPNUDPObfuscated = "OpenVPN UDP Obfuscated",
    P2P = "P2P",
    Skylark = "Skylark",
    Socks5 = "Socks 5",
    VPNStandard = "VPN standard",
    Wireguard = "Wireguard",
}
