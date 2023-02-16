import { KeyValue, KeyValueImpl } from '@homeapi/ctsdk';

/**
 * Turns a JSON config to KeyValue objects
 * @param config
 * @returns
 */
export function keyValueFromConfig(
  keyValue: KeyValue[],
): KeyValue[]
export function keyValueFromConfig(
  config: Record<string, unknown>,
): KeyValue[]
export function keyValueFromConfig(
  keyValueA: KeyValue[],
  keyValueB: KeyValue[],
): KeyValue[]
export function keyValueFromConfig(
  keyValueA: KeyValue[],
  configB: Record<string, unknown>,
): KeyValue[]
export function keyValueFromConfig(
  configA: Record<string, unknown>,
  keyValueB: KeyValue[],
): KeyValue[]
export function keyValueFromConfig(
  configA: Record<string, unknown>,
  configB: Record<string, unknown>,
): KeyValue[]
export function keyValueFromConfig(
  config1: Record<string, unknown> | KeyValue[],
  config2?: Record<string, unknown> | KeyValue[],
): KeyValue[]
 {

  const dedup = (a: KeyValue[] = [], b: KeyValue[] = []): KeyValue[] => {
    return [...new Map<string, KeyValue>(
      ([...a, ...b] as KeyValue[])
        .map((l: KeyValue) => ([l.key, l] as const)).values()
    ).values()]
  }


  const lfc = (
    config: Record<string, unknown> | KeyValue[],
    prefix: string,
    acc: KeyValue[],
  ): KeyValue[] => {
    if (config instanceof Array) return config
    const entries = Object.entries(config).flatMap(([key, value]) => {
      if (value instanceof Object)
        return lfc(value as Record<any, any>, `${prefix}${key}.`, acc);
      return new KeyValueImpl({ key: `${prefix}${key}`, value: value });
    });
    return [...acc, ...entries]
  };

  return [...dedup([...lfc(config1, '', []), ...lfc(config2 || [], '', [])])];
}
