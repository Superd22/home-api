export interface Port  {
  mode?: string;
  host_ip?: string;
  target?: PortValue | PortRange;
  published?: PortValue | PortRange
  protocol?: "udp" | "tcp";
  /**
   * This interface was referenced by `undefined`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}

type PortValue = number
type PortRange = `${PortValue}:${PortValue}`